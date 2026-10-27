#!/usr/bin/env bash
# ============================================================
# 安全修复 curl 攻击验证脚本
# 用法:
#   1. 启动应用(本地或线上), 把 BASE_URL 改成实际地址
#   2. 登录一个【普通(非管理员)账号】, 从浏览器复制 Cookie,
#      填到 USER_COOKIE (整串 Cookie 即可)
#   3. bash scripts/security-verify.sh
# 说明:
#   - 每项测试打印 [PASS]/[FAIL], PASS=修复生效
#   - 期望状态码是集合匹配, 个别接口若返回 401/403/400
#     之一均视为拦截成功
# ============================================================

BASE_URL="http://localhost:3000"   # 改成实际地址
USER_COOKIE=""                     # 普通用户整串 Cookie (可留空, 留空则跑未登录组)

PASS=0; FAIL=0

check() {
  local name="$1"; shift
  local expect="$1"; shift   # 逗号分隔的期望状态码, 如 "401,403"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  if echo ",$expect," | grep -q ",$actual,"; then
    echo "[PASS] $name  (HTTP $actual, 期望 $expect)"
    PASS=$((PASS+1))
  else
    echo "[FAIL] ⚠️  $name  (HTTP $actual, 期望 $expect) —— 可能存在漏洞!"
    FAIL=$((FAIL+1))
  fi
}

echo "======== 一、未登录攻击组 (无需 Cookie) ========"

# SEC-02/03/04: admin 接口未授权访问
check "SEC-02/03/04 未登录调风控统计接口" "401,403,307,302" \
  "$BASE_URL/api/admin/risk-stats"

# SEC-10/模型白名单: 未登录调生成接口
check "SEC-10 未登录调 AI 生成接口" "401,403" \
  -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{"provider":"replicate","mediaType":"image","model":"stability-ai/sdxl","prompt":"test"}'

# chat 越权: 未登录读他人会话
check "chat 会话未登录访问" "401,403,400" \
  "$BASE_URL/api/chat/messages?chatId=11111111-1111-1111-1111-111111111111"

# showcases 未登录写入
check "showcase 未登录提交" "401,403" \
  -X POST "$BASE_URL/api/showcases/add" \
  -H "Content-Type: application/json" -d '{"title":"x"}'

# SEC-11 SSRF: 代理接口访问云元数据地址
check "SEC-11 SSRF 云元数据 169.254.169.254" "400,403,500" \
  "$BASE_URL/api/proxy/file?url=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F"

# SEC-11 SSRF: 内网地址
check "SEC-11 SSRF 内网 127.0.0.1" "400,403,500" \
  "$BASE_URL/api/proxy/file?url=http%3A%2F%2F127.0.0.1%3A3000%2F"

# SEC-11 SSRF: 内网网段
check "SEC-11 SSRF 内网 10.0.0.1" "400,403,500" \
  "$BASE_URL/api/proxy/file?url=http%3A%2F%2F10.0.0.1%2Fadmin"

echo ""
echo "======== 二、普通用户越权组 (需 USER_COOKIE) ========"

if [ -n "$USER_COOKIE" ]; then
  # SEC-02/03/04: 普通用户(非管理员)调 admin 接口
  check "SEC-02/03/04 普通用户调风控统计" "401,403" \
    "$BASE_URL/api/admin/risk-stats" -H "Cookie: $USER_COOKIE"

  # SEC-10: 普通用户伪造 credits=0 (服务端应忽略, 按真实价格扣或拒绝)
  check "SEC-10 伪造 credits=0 提交生成" "400,402,403,422" \
    -X POST "$BASE_URL/api/ai/generate" \
    -H "Content-Type: application/json" -H "Cookie: $USER_COOKIE" \
    -d '{"provider":"replicate","mediaType":"image","model":"stability-ai/sdxl","prompt":"test","credits":0}'

  # 模型白名单: 不在白名单内的模型
  check "模型白名单 拒绝未知模型" "400,403,422" \
    -X POST "$BASE_URL/api/ai/generate" \
    -H "Content-Type: application/json" -H "Cookie: $USER_COOKIE" \
    -d '{"provider":"replicate","mediaType":"image","model":"attacker/evil-model","prompt":"test"}'

  # SEC-17: checkout 伪造积分数量的套餐
  check "SEC-17 checkout 伪造 credits 字段" "400,402,403,422" \
    -X POST "$BASE_URL/api/payment/checkout" \
    -H "Content-Type: application/json" -H "Cookie: $USER_COOKIE" \
    -d '{"plan":"premium-monthly","credits":999999,"amount":1}'
else
  echo "(USER_COOKIE 未填, 跳过本组)"
fi

echo ""
echo "======== 三、SEC-08 登录限流 (手动验证) ========"
cat <<'TIP'
SEC-08 需要真实账号密码, 不适合脚本盲跑, 手动步骤:
  1. 用错误密码连续登录同一账号 6 次:
     for i in $(seq 1 6); do
       curl -s -o /dev/null -w "%{http_code}\n" \
         -X POST "$BASE_URL/api/auth/callback/credentials" \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"wrong-'"$i"'"}'
     done
  2. 预期: 前 5 次返回登录失败(401), 第 6 次起被限流(429/403),
     且 oddbeam.login_attempt 表新增记录, 连续失败后 oddbeam.ip_blacklist 出现该 IP
  3. 用正确密码也应暂时被拒 → 证明按 IP 限流生效
TIP

echo ""
echo "======== 结果汇总 ========"
echo "通过: $PASS   未通过: $FAIL"
[ $FAIL -eq 0 ] && echo "✅ 全部拦截成功" || echo "❌ 存在未拦截项, 把 [FAIL] 行发给开发"
