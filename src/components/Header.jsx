import React from "react";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import { Link, useLocation } from "react-router-dom";
import antdTheme from "../config/theme";
import { useUserStore } from "../store/modules/userStore"
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const { isLoggedIn, userInfo, logout } = useUserStore();
  const location = useLocation();

  // 导航菜单项
  const menuItems = [
    {
      key: "demand",
      label: <Link to="/demand">需求中心</Link>,
    },
    {
      key: "i-need",
      label: <Link to="/i-need">我需要</Link>,
    },
    {
      key: "i-serve",
      label: <Link to="/i-serve">我服务</Link>,
    },
    {
      key: "analytics",
      label: <Link to="/analytics">统计分析</Link>,
    },
    {
      key: "about",
      label: <Link to="/about">关于我们</Link>,
    },
  ];

  // 用户菜单
  const userMenu = [
    {
      key: "profile",
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: "logout",
      label: (
        <span onClick={() => logout()} style={{ cursor: "pointer" }}>
          <LogoutOutlined /> 退出登录
        </span>
      ),
    },
  ];

  // 认证菜单
  const authMenu = [
    {
      key: "login",
      label: <Link to="/login">登录</Link>,
    },
    {
      key: "register",
      label: <Link to="/register">注册</Link>,
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: antdTheme.token.colorPrimary,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="logo"
        style={{
          color: antdTheme.token.colorTextSecondary,
          fontSize: "30px",
          fontWeight: "bold",
          marginRight: "50px",
        }}
      >
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          Good Service
        </Link>
      </div>
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["demand"]}
        selectedKeys={[
          location.pathname === "/"
            ? "demand"
            : location.pathname.split("/")[1] || "",
        ]}
        style={{
          backgroundColor: antdTheme.token.colorPrimary,
          flex: 1,
          justifyContent: "flex-end",
        }}
        items={[
          ...menuItems,
          ...(isLoggedIn
            ? [
                {
                  key: "user",
                  label: (
                    <Dropdown
                      menu={{ items: userMenu }}
                      placement="bottomRight"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ marginRight: 8 }}
                        />
                        <span
                          style={{ color: antdTheme.token.colorTextSecondary }}
                        >
                          {userInfo.username || "用户"}
                        </span>
                      </div>
                    </Dropdown>
                  ),
                },
              ]
            : authMenu),
        ]}
      />
    </Header>
  );
};

export default AppHeader;
