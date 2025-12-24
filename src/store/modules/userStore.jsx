import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi } from '../../api/modules/auth';
import { updateUserByPatch } from '../../api/modules/user';

// 定义用户信息类型
const initialUserInfo = {
  id: null,
  username: '',
  email: '',
  phone: '',
  avatar: '',
  createdAt: null,
  updatedAt: null,
};

// 创建userStore
export const useUserStore = create(
  persist(
    (set, get) => ({
      // 状态
      isLoggedIn: false,
      token: null,
      userInfo: initialUserInfo,
      loading: false,
      error: null,

      // 方法
      // 登录
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的登录API
          const response = await loginApi(credentials);
          
          // 只要返回了token就是登录成功
          const { token, user } = response;
          
          // 如果没有用户信息，创建默认用户信息
          const userInfo = user || {
            id: 'user-' + Date.now(),
            username: credentials.username,
            email: '',
            phone: '',
            avatar: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            isLoggedIn: true,
            token: token,
            userInfo: userInfo,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '登录失败',
          });
          return false;
        }
      },

      // 注册
      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的注册API
          const response = await registerApi(userData);
          
          // API返回格式为用户信息对象，不包含token
          const user = response.data;
          
          // 生成临时token（实际应用中可能需要后端返回token或单独的登录步骤）
          const token = 'temp-token-' + Date.now();

          set({
            isLoggedIn: true,
            token: token,
            userInfo: user,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '注册失败',
          });
          return false;
        }
      },

      // 登出
      logout: () => {
        set({
          isLoggedIn: false,
          token: null,
          userInfo: initialUserInfo,
          error: null,
        });
      },

      // 更新用户信息
      updateUserInfo: async (updates) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的更新用户信息API
          const currentUser = get().userInfo;
          const response = await updateUserByPatch(currentUser.username, updates);
          
          // 假设API返回更新后的用户信息
          const updatedUser = response.data;

          set({
            userInfo: updatedUser,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '更新用户信息失败',
          });
          return false;
        }
      },

      // 设置认证令牌
      setToken: (token) => {
        set({ token });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      // 持久化配置
      name: 'user-storage', // 存储的键名
      partialize: (state) => ({
        // 只持久化需要的数据
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);