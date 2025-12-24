import React from "react";
import { Form, Input, Button, Card, Typography, Space, message } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/modules/userStore";
import antdTheme from "../../config/theme";

// 使用import引入背景图
import backgroundImage from "../../assets/bg_base.png";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { login, loading, error, clearError } = useUserStore();

  const onFinish = async (values) => {
    clearError();
    const success = await login(values);

    if (success) {
      message.success("登录成功");
      navigate("/");
    } else {
      message.error(error || "登录失败");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-body)",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card
        style={{
          width: 400,
          padding: "24px",
          backgroundColor: antdTheme.token.colorBgContainer,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title
            level={2}
            style={{ color: antdTheme.token.colorTextSecondary }}
          >
            登录
          </Title>
          <Text
            type="secondary"
            style={{ color: antdTheme.token.colorTextTertiary }}
          >
            欢迎回来，请登录您的账户
          </Text>
        </div>

        <Form form={form} name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
            label={
              <Text style={{ color: antdTheme.token.colorTextTertiary }}>
                用户名
              </Text>
            }
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              style={{
                borderColor: antdTheme.token.colorBorder,
                color: antdTheme.token.colorText,
              }}
              placeholderStyle={{ color: antdTheme.token.colorTextDisabled }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
            label={
              <Text style={{ color: antdTheme.token.colorTextTertiary }}>
                密码
              </Text>
            }
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              style={{
                borderColor: antdTheme.token.colorBorder,
                color: antdTheme.token.colorText,
              }}
              placeholderStyle={{ color: antdTheme.token.colorTextDisabled }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                backgroundColor: antdTheme.token.colorPrimary,
                borderColor: antdTheme.token.colorPrimary,
                height: "40px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor =
                    antdTheme.token.colorPrimaryHover;
                  e.target.style.borderColor =
                    antdTheme.token.colorPrimaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = antdTheme.token.colorPrimary;
                  e.target.style.borderColor = antdTheme.token.colorPrimary;
                }
              }}
            >
              登录
            </Button>
          </Form.Item>

          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Link
              style={{ color: "var(--link-color)" }}
              onClick={() => message.info("密码找回功能开发中")}
            >
              忘记密码
            </Link>
            <Link style={{ color: "var(--link-color)" }} to="/register">
              注册新账户
            </Link>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
