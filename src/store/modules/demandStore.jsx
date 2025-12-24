import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAllDemands, publishDemand, updateDemand, getDemandById, getMyDemands } from "../../api/modules/demand";
import { getAllServiceTypes } from "../../api/modules/service";
import { searchLocations } from "../../api/modules/location";
import { getMyResponses, submitResponse, updateResponse, deleteResponse, acceptResponse, rejectResponse } from "../../api/modules/response";

// 数据处理工具函数
const processApiData = (apiData, serviceTypeMap = {}, locationMap = {}) => {
  return apiData.map(item => {
    // 将时间戳转换为Date对象
    const convertTimestamp = (timestamp) => {
      if (timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000 + (timestamp.nanos || 0) / 1000000);
      }
      return new Date();
    };
    
    // 默认映射
    const defaultServiceTypeMap = {
      1: "管道维修",
      2: "助老服务", 
      3: "保洁服务",
      4: "就诊服务",
      5: "营养餐服务",
      6: "定期接送服务"
    };
    
    const defaultLocationMap = {
      1: "幸福小区1号楼3单元502室",
      2: "阳光家园2号楼2单元301室",
      3: "和谐社区3号楼1单元201室",
      4: "安康小区4号楼5单元602室",
      5: "福寿园5号楼3单元401室",
      6: "希望小学附近"
    };
    
    const finalServiceTypeMap = Object.keys(serviceTypeMap).length > 0 ? serviceTypeMap : defaultServiceTypeMap;
    const finalLocationMap = Object.keys(locationMap).length > 0 ? locationMap : defaultLocationMap;
    
    return {
      id: item.id?.toString() || Date.now().toString(),
      userId: item.userId?.toString() || "unknown",
      type: finalServiceTypeMap[item.serviceId] || "其他服务",
      title: item.title || "未命名需求",
      description: item.description || "暂无描述",
      status: item.status || "PUBLISHED",
      createTime: convertTimestamp(item.createdAt).toISOString(),
      updateTime: convertTimestamp(item.modifiedAt).toISOString(),
      address: finalLocationMap[item.locationId] || "地址未知",
      // 保留原始API数据
      originalData: item
    };
  });
};

export const useDemandStore = create(
  persist(
    (set, get) => ({
      // 状态
      demands: null,
      filteredDemands: null,
      currentDemand: null,
      loading: false,
      error: null,
      filterType: "all",
      searchKeyword: "",
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      serviceTypes: null,
      serviceTypeMap: {}, // 服务类型ID到名称的映射
      serviceResponses: null,
      myServiceResponses: [], // 用户的服务响应列表

      // 方法
      // 获取所有需求（从API）
      fetchAllDemands: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getAllDemands();
          const apiData = response.data || response;
          const processedData = processApiData(apiData, get().serviceTypeMap, get().locationMap || {});
          
          set({ 
            demands: processedData,
            filteredDemands: processedData,
            loading: false 
          });
          
          return processedData;
        } catch (error) {
          console.error('获取需求列表失败:', error);
          set({ 
            error: error.message || '获取需求列表失败',
            loading: false 
          });
        }
      },

      // 获取所有需求（本地数据）
      getAllDemands: () => {
        set({ filteredDemands: get().demands });
      },

      // 获取所有服务类型（从API）
      fetchServiceTypes: async () => {
        try {
          const response = await getAllServiceTypes();
          const apiData = response.data || response;
          
          // 处理服务类型数据
          const processedTypes = apiData.map(item => item.name || item.title || `服务类型${item.id}`);
          
          // 建立服务类型映射
          const newServiceTypeMap = {};
          apiData.forEach((item, index) => {
            newServiceTypeMap[item.id] = item.name || item.title || `服务类型${item.id}`;
          });
          
          set({ 
            serviceTypes: processedTypes,
            serviceTypeMap: newServiceTypeMap 
          });
          
          return processedTypes;
        } catch (error) {
          console.error('获取服务类型失败:', error);
          // 如果API调用失败，使用模拟数据
          set({ serviceTypes: serviceTypes });
        }
      },

      // 按类型筛选需求
      filterByType: (type) => {
        const { demands, searchKeyword } = get();
        set({ filterType: type });

        let filtered = demands;
        if (type !== "all") {
          filtered = demands.filter((demand) => demand.type === type);
        }

        if (searchKeyword) {
          filtered = filtered.filter(
            (demand) =>
              demand.title.includes(searchKeyword) ||
              demand.description.includes(searchKeyword)
          );
        }

        set({
          filteredDemands: filtered,
          pagination: {
            ...get().pagination,
            total: filtered.length,
            current: 1,
          },
        });
      },

      // 按用户ID筛选需求（调用API获取用户的需求）
      filterByUserId: async (userId) => {
        set({ loading: true, error: null });
        try {
          // 调用API获取用户的需求
          const response = await getMyDemands(userId);
          const apiData = response.data || response;
          
          // 处理API返回的数据
          const processedData = processApiData(apiData, get().serviceTypeMap, get().locationMap || {});
          
          // 应用类型和关键词筛选
          let filtered = processedData;
          
          if (get().filterType !== "all") {
            filtered = filtered.filter((demand) => demand.type === get().filterType);
          }

          if (get().searchKeyword) {
            filtered = filtered.filter(
              (demand) =>
                demand.title.includes(get().searchKeyword) ||
                demand.description.includes(get().searchKeyword)
            );
          }

          set({
            filteredDemands: filtered,
            demands: processedData, // 更新总的需求列表为用户的需求
            pagination: {
              ...get().pagination,
              total: filtered.length,
              current: 1,
            },
            loading: false
          });
          
          return filtered;
        } catch (error) {
          console.error('获取我的需求失败:', error);
          set({ 
            error: error.message || '获取我的需求失败',
            loading: false,
            filteredDemands: [] // 出错时清空需求列表
          });
          
          // 如果API调用失败，回退到本地数据过滤
          const { demands, filterType, searchKeyword } = get();
          let filtered = demands || [];
          if (userId) {
            // 先尝试按userId筛选
            const userFiltered = demands.filter(
              (demand) => demand.userId === userId
            );
            // 如果筛选结果为空，则返回所有数据
            filtered = userFiltered.length > 0 ? userFiltered : demands;
          }

          if (filterType !== "all") {
            filtered = filtered.filter((demand) => demand.type === filterType);
          }

          if (searchKeyword) {
            filtered = filtered.filter(
              (demand) =>
                demand.title.includes(searchKeyword) ||
                demand.description.includes(searchKeyword)
            );
          }

          set({
            filteredDemands: filtered,
            pagination: {
              ...get().pagination,
              total: filtered.length,
              current: 1,
            },
          });
          
          return filtered;
        }
      },

      // 搜索需求
      searchDemands: (keyword) => {
        const { demands, filterType } = get();
        set({ searchKeyword: keyword });

        let filtered = demands;
        if (filterType !== "all") {
          filtered = demands.filter((demand) => demand.type === filterType);
        }

        if (keyword) {
          filtered = filtered.filter(
            (demand) =>
              demand.title.includes(keyword) ||
              demand.description.includes(keyword) ||
              demand.address.includes(keyword)
          );
        }

        set({
          filteredDemands: filtered,
          pagination: {
            ...get().pagination,
            total: filtered.length,
            current: 1,
          },
        });
      },

      // 分页处理
      handlePaginationChange: (page, pageSize) => {
        set({
          pagination: {
            ...get().pagination,
            current: page,
            pageSize: pageSize,
          },
        });
      },

      // 获取单个需求详情（调用真实API）
      getDemandById: async (id) => {
        try {
          set({ loading: true, error: null });
          
          // 调用API获取需求详情
          const response = await getDemandById(parseInt(id));
          const apiData = response.data || response;
          
          // 处理API返回的数据
          const demand = processApiData([apiData], get().serviceTypeMap, get().locationMap || {})[0];
          
          // 更新当前选中的需求
          set({ currentDemand: demand });
          
          // 如果本地demands中没有这个需求，添加到本地
          const existingDemand = get().demands.find((d) => d.id === id);
          if (!existingDemand) {
            const updatedDemands = [...get().demands, demand];
            set({ demands: updatedDemands });
          } else {
            // 更新本地demands中的需求
            const updatedDemands = get().demands.map((d) => 
              d.id === id ? demand : d
            );
            set({ demands: updatedDemands });
          }
          
          set({ loading: false });
          return demand;
          
        } catch (error) {
          console.error('获取需求详情失败:', error);
          set({ 
            error: error.message || '获取需求详情失败',
            loading: false 
          });
          
          // 如果API调用失败，回退到本地查找
          const demand = get().demands.find((d) => d.id === id);
          set({ currentDemand: demand });
          return demand;
        }
      },

      // 创建新需求（调用真实API）
      createDemand: async (demandData) => {
        try {
          set({ loading: true, error: null });
          
          // 如果提供了address，先通过searchLocations获取locationId
          let locationId = demandData.locationId || 1;
          if (demandData.address && !demandData.locationId) {
            try {
              const locationResponse = await searchLocations(demandData.address);
              const locations = locationResponse.data || locationResponse;
              if (locations && locations.length > 0) {
                locationId = locations[0].id; // 使用第一个匹配结果的ID
              }
            } catch (locationError) {
              console.warn('地址搜索失败，使用默认locationId:', locationError);
              // 使用默认的locationId映射
              locationId = get().getLocationIdFromAddress(demandData.address);
            }
          }
          
          // 准备API数据格式
          const apiData = {
            locationId: locationId,
            serviceId: demandData.serviceId || get().getServiceIdFromTypeName(demandData.type) || 1,
            title: demandData.title || "",
            description: demandData.description || "",
            startTime: demandData.startTime || { seconds: Math.floor(Date.now() / 1000), nanos: 0 },
            endTime: demandData.endTime || { seconds: Math.floor(Date.now() / 1000) + 86400, nanos: 0 }
          };
          
          // 调用API创建需求
          const response = await publishDemand(demandData.userId, apiData);
          const apiResponse = response.data || response;
          
          // 处理API返回的数据
          const newDemand = processApiData([apiResponse], get().serviceTypeMap, get().locationMap || {})[0];
          
          // 更新本地状态
          const updatedDemands = [...get().demands, newDemand];
          set({ demands: updatedDemands });
          get().filterByType(get().filterType); // 重新应用筛选
          
          set({ loading: false });
          return newDemand;
          
        } catch (error) {
          console.error('创建需求失败:', error);
          set({ 
            error: error.message || '创建需求失败',
            loading: false 
          });
          
          // 如果API调用失败，回退到本地创建
          const fallbackDemand = {
            id: Date.now().toString(),
            userId: demandData.userId || "unknown",
            type: demandData.type || "其他服务",
            title: demandData.title || "未命名需求",
            description: demandData.description || "暂无描述",
            status: "PUBLISHED",
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            address: demandData.address || "地址未知",
            originalData: demandData
          };
          
          const updatedDemands = [...get().demands, fallbackDemand];
          set({ demands: updatedDemands });
          get().filterByType(get().filterType);
          
          return fallbackDemand;
        }
      },

      // 更新需求（调用真实API）
      updateDemand: async (id, updateData) => {
        try {
          set({ loading: true, error: null });
          
          // 如果提供了address，先通过searchLocations获取locationId
          let locationId = updateData.locationId || 1;
          if (updateData.address && !updateData.locationId) {
            try {
              const locationResponse = await searchLocations(updateData.address);
              const locations = locationResponse.data || locationResponse;
              if (locations && locations.length > 0) {
                locationId = locations[0].id; // 使用第一个匹配结果的ID
              } else {
                // 如果没有搜索结果，使用默认映射
                locationId = get().getLocationIdFromAddress(updateData.address);
              }
            } catch (locationError) {
              console.warn('地址搜索失败，使用默认locationId:', locationError);
              // 使用默认的locationId映射
              locationId = get().getLocationIdFromAddress(updateData.address);
            }
          }
          
          // 准备API数据格式
          const apiData = {
            locationId: locationId,
            serviceId: updateData.serviceId || get().getServiceIdFromTypeName(updateData.type) || 1,
            title: updateData.title || "",
            description: updateData.description || "",
            startTime: updateData.startTime || { seconds: Math.floor(Date.now() / 1000), nanos: 0 },
            endTime: updateData.endTime || { seconds: Math.floor(Date.now() / 1000) + 86400, nanos: 0 }
          };
          
          // 调用API更新需求
          const response = await updateDemand(parseInt(id), apiData);
          const apiResponse = response.data || response;
          
          // 处理API返回的数据
          const updatedDemand = processApiData([apiResponse], get().serviceTypeMap, get().locationMap || {})[0];
          
          // 更新本地状态
          const updatedDemands = get().demands.map((demand) =>
            demand.id === id ? updatedDemand : demand
          );
          
          set({ demands: updatedDemands });
          get().filterByType(get().filterType); // 重新应用筛选
          
          // 更新当前选中的需求
          if (get().currentDemand?.id === id) {
            set({ currentDemand: updatedDemand });
          }
          
          set({ loading: false });
          return updatedDemand;
          
        } catch (error) {
          console.error('更新需求失败:', error);
          set({ 
            error: error.message || '更新需求失败',
            loading: false 
          });
          
          // 如果API调用失败，回退到本地更新
          const updatedDemands = get().demands.map((demand) =>
            demand.id === id
              ? { ...demand, ...updateData, updateTime: new Date().toISOString() }
              : demand
          );

          set({ demands: updatedDemands });
          get().filterByType(get().filterType);

          // 更新当前选中的需求
          if (get().currentDemand?.id === id) {
            set({
              currentDemand: {
                ...get().currentDemand,
                ...updateData,
                updateTime: new Date().toISOString(),
              },
            });
          }
          
          return get().demands.find(d => d.id === id);
        }
      },
      
      // 辅助函数：从服务类型名称获取serviceId
      getServiceIdFromTypeName: (typeName) => {
        if (!typeName) return 1;
        
        // 优先使用store中的serviceTypeMap
        const serviceTypeMap = get().serviceTypeMap;
        if (serviceTypeMap && Object.keys(serviceTypeMap).length > 0) {
          for (const [id, name] of Object.entries(serviceTypeMap)) {
            if (name === typeName) {
              return parseInt(id);
            }
          }
        }
        
        // 回退到默认映射
        const defaultMapping = {
          "管道维修": 1,
          "助老服务": 2, 
          "保洁服务": 3,
          "就诊服务": 4,
          "营养餐服务": 5,
          "定期接送服务": 6
        };
        
        return defaultMapping[typeName] || 1;
      },
      
      // 辅助函数：从地址获取locationId
      getLocationIdFromAddress: (address) => {
        if (!address) return 1;
        
        // 简单的地址到locationId映射
        const addressMapping = {
          "幸福小区": 1,
          "阳光家园": 2,
          "和谐社区": 3,
          "安康小区": 4,
          "福寿园": 5
        };
        
        for (const [key, id] of Object.entries(addressMapping)) {
          if (address.includes(key)) {
            return id;
          }
        }
        
        return 1; // 默认locationId
      },

      // 删除需求
      deleteDemand: (id) => {
        const updatedDemands = get().demands.filter(
          (demand) => demand.id !== id
        );
        set({ demands: updatedDemands });
        get().filterByType(get().filterType); // 重新应用筛选

        // 如果删除的是当前选中的需求，清空currentDemand
        if (get().currentDemand?.id === id) {
          set({ currentDemand: null });
        }
      },

      // 重置筛选和搜索
      resetFilters: () => {
        set({
          filterType: "all",
          searchKeyword: "",
          pagination: { ...get().pagination, current: 1 },
        });
        get().getAllDemands();
      },

      // 获取当前用户的所有服务响应
      getMyServiceResponses: async (userId) => {
        set({ loading: true, error: null });
        try {
          // 调用API获取用户的服务响应
          const response = await getMyResponses();
          const apiData = response.data || response;
          
          // 处理API返回的响应数据
          const processedResponses = apiData.map(item => {
            // 转换时间戳
            const convertTimestamp = (timestamp) => {
              if (timestamp && typeof timestamp.seconds === 'number') {
                return new Date(timestamp.seconds * 1000 + (timestamp.nanos || 0) / 1000000);
              }
              return new Date();
            };
            
            return {
              id: item.id?.toString() || Date.now().toString(),
              userId: item.userId?.toString() || userId,
              demandId: item.demandId?.toString() || "",
              content: item.content || item.description || "暂无响应内容",
              status: item.status || "PENDING",
              responseTime: convertTimestamp(item.createdAt || item.responseTime).toISOString(),
              demandTitle: item.title || "未知需求",
              demandStatus: item.status || "未知状态",
              // 保留原始数据
              originalData: item
            };
          });
          
          // 为响应添加需求详细信息（如果还没有的话）
          const { demands } = get();
          const responsesWithDemandInfo = processedResponses.map((response) => {
            if (response.demandTitle === "未知需求" && demands) {
              const demand = demands.find((d) => d.id === response.demandId);
              return {
                ...response,
                demandTitle: demand?.title || "未知需求",
                serviceType: demand?.type || "未知类型",
                demandStatus: demand?.status || "未知状态",
              };
            }
            return response;
          });
          
          set({ 
            myServiceResponses: responsesWithDemandInfo,
            loading: false 
          });
          
          return responsesWithDemandInfo;
        } catch (error) {
          console.error('获取我的服务响应失败:', error);
          set({ 
            error: error.message || '获取我的服务响应失败',
            loading: false,
            myServiceResponses: [] // 出错时清空响应列表
          });
          
          // 如果API调用失败，回退到本地数据过滤
          const { serviceResponses, demands } = get();
          const myResponses = serviceResponses.filter(
            (response) => response.userId === userId
          );
          const responsesWithDemandInfo = myResponses.map((response) => {
            const demand = demands.find((d) => d.id === response.demandId);
            return {
              ...response,
              demandTitle: demand?.title || "未知需求",
              serviceType: demand?.type || "未知类型",
              demandStatus: demand?.status || "未知状态",
            };
          });
          
          set({ myServiceResponses: responsesWithDemandInfo });
          return responsesWithDemandInfo;
        }
      },

      // 创建新的服务响应
      createServiceResponse: async (responseData) => {
        const { serviceResponses, demands } = get();
        const demand = demands.find((d) => d.id === responseData.demandId);

        try {
          // 调用API创建响应
          const apiResponse = await submitResponse(responseData);
          const apiData = apiResponse.data || apiResponse;
          
          // 处理API返回的数据
          const newResponse = {
            id: apiData.id?.toString() || Date.now().toString(),
            responseTime: apiData.createdAt ? new Date(apiData.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
            status: apiData.status || "PENDING",
            demandTitle: demand?.title || "未知需求",
            serviceType: demand?.type || "未知类型",
            demandStatus: demand?.status || "未知状态",
            ...responseData,
            originalData: apiData
          };

          const updatedResponses = [...serviceResponses, newResponse];
          set({ serviceResponses: updatedResponses });

          // 如果当前用户正在查看自己的响应，也更新myServiceResponses
          if (get().myServiceResponses.length > 0) {
            get().getMyServiceResponses(responseData.userId);
          }

          return newResponse;
        } catch (error) {
          console.error('创建响应失败:', error);
          
          // 如果API调用失败，回退到本地创建
          const fallbackResponse = {
            id: Date.now().toString(),
            responseTime: new Date().toISOString(),
            status: "PENDING",
            demandTitle: demand?.title || "未知需求",
            serviceType: demand?.type || "未知类型",
            demandStatus: demand?.status || "未知状态",
            ...responseData,
          };

          const updatedResponses = [...serviceResponses, fallbackResponse];
          set({ serviceResponses: updatedResponses });

          return fallbackResponse;
        }
      },

      // 更新服务响应
      updateServiceResponse: async (id, updateData) => {
        const { serviceResponses } = get();

        try {
          // 调用API更新响应
          const apiResponse = await updateResponse(parseInt(id), updateData);
          const apiData = apiResponse.data || apiResponse;
          
          // 处理API返回的数据
          const updatedApiResponse = {
            id: apiData.id?.toString() || id,
            responseTime: apiData.modifiedAt ? new Date(apiData.modifiedAt.seconds * 1000).toISOString() : new Date().toISOString(),
            status: apiData.status || "PENDING",
            ...updateData,
            originalData: apiData
          };

          const updatedResponses = serviceResponses.map((response) =>
            response.id === id ? { ...response, ...updatedApiResponse } : response
          );

          set({ serviceResponses: updatedResponses });

          // 更新myServiceResponses
          const userId = updatedResponses.find((r) => r.id === id)?.userId;
          if (userId) {
            get().getMyServiceResponses(userId);
          }

          return updatedResponses;
        } catch (error) {
          console.error('更新响应失败:', error);
          
          // 如果API调用失败，回退到本地更新
          const updatedResponses = serviceResponses.map((response) =>
            response.id === id ? { ...response, ...updateData, updateTime: new Date().toISOString() } : response
          );

          set({ serviceResponses: updatedResponses });

          // 更新myServiceResponses
          const userId = updatedResponses.find((r) => r.id === id)?.userId;
          if (userId) {
            get().getMyServiceResponses(userId);
          }

          return updatedResponses;
        }
      },

      // 删除服务响应
      deleteMyServiceResponse: async (id) => {
        const { serviceResponses } = get();

        try {
          // 调用API删除响应
          await deleteResponse(parseInt(id));
          
          // API调用成功后，更新本地状态
          const updatedResponses = serviceResponses.filter(
            (response) => response.id !== id
          );
          set({ serviceResponses: updatedResponses });

          // 更新myServiceResponses
          const deletedResponse = serviceResponses.find((r) => r.id === id);
          if (deletedResponse?.userId) {
            get().getMyServiceResponses(deletedResponse.userId);
          }

          return updatedResponses;
        } catch (error) {
          console.error('删除响应失败:', error);
          
          // 如果API调用失败，回退到本地删除
          const updatedResponses = serviceResponses.filter(
            (response) => response.id !== id
          );
          set({ serviceResponses: updatedResponses });

          // 更新myServiceResponses
          const deletedResponse = serviceResponses.find((r) => r.id === id);
          if (deletedResponse?.userId) {
            get().getMyServiceResponses(deletedResponse.userId);
          }

          return updatedResponses;
        }
      },

      // 接受响应
      acceptResponse: async (responseId) => {
        try {
          // 调用API接受响应
          const apiResponse = await acceptResponse(parseInt(responseId));
          const apiData = apiResponse.data || apiResponse;
          
          // 更新本地响应状态
          const { serviceResponses } = get();
          const updatedResponses = serviceResponses.map((response) =>
            response.id === responseId 
              ? { 
                  ...response, 
                  status: "ACCEPTED",
                  originalData: apiData 
                }
              : response
          );
          
          set({ serviceResponses: updatedResponses });
          
          // 如果接受了某个响应，需要隐式拒绝其他对同一需求的响应
          const acceptedResponse = updatedResponses.find(r => r.id === responseId);
          if (acceptedResponse) {
            get().implicitlyRejectOtherResponses(acceptedResponse.demandId, responseId);
          }
          
          // 刷新用户响应列表
          if (acceptedResponse?.userId) {
            get().getMyServiceResponses(acceptedResponse.userId);
          }
          
          return updatedResponses;
        } catch (error) {
          console.error('接受响应失败:', error);
          throw error;
        }
      },

      // 拒绝响应
      rejectResponse: async (responseId) => {
        try {
          // 调用API拒绝响应
          const apiResponse = await rejectResponse(parseInt(responseId));
          const apiData = apiResponse.data || apiResponse;
          
          // 更新本地响应状态
          const { serviceResponses } = get();
          const updatedResponses = serviceResponses.map((response) =>
            response.id === responseId 
              ? { 
                  ...response, 
                  status: "REJECTED",
                  originalData: apiData 
                }
              : response
          );
          
          set({ serviceResponses: updatedResponses });
          
          // 刷新用户响应列表
          const rejectedResponse = serviceResponses.find(r => r.id === responseId);
          if (rejectedResponse?.userId) {
            get().getMyServiceResponses(rejectedResponse.userId);
          }
          
          return updatedResponses;
        } catch (error) {
          console.error('拒绝响应失败:', error);
          throw error;
        }
      },

      // 隐式拒绝其他响应（当某个响应被接受时）
      implicitlyRejectOtherResponses: (demandId, acceptedResponseId) => {
        const { serviceResponses } = get();
        const updatedResponses = serviceResponses.map((response) => {
          if (response.demandId === demandId && response.id !== acceptedResponseId && response.status === "PENDING") {
            return {
              ...response,
              status: "IMPLICITLY_REJECTED"
            };
          }
          return response;
        });
        
        set({ serviceResponses: updatedResponses });
      },
    }),
    { name: "demand-storage" }
  )
);