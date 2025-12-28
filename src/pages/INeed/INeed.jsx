import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from '../../utils/timeUtils';
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Spin,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ConfigProvider from "antd/es/config-provider";
import { useDemandStore } from "../../store/modules/demandStore";
import { useUserStore } from "../../store/modules/userStore";
import { getLocationById } from "../../api/modules/location";
import antdTheme from "../../config/theme";
const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const INeed = () => {
  const navigate = useNavigate();
  
  // 位置信息缓存
  const [locationCache, setLocationCache] = useState({});

  // 从userStore获取用户状态
  const { isLoggedIn, userInfo } = useUserStore();

  // 从store获取状态和方法
  const {
    filteredDemands,
    filterType,
    searchKeyword,
    pagination,
    serviceTypes,
    loading,
    filterByType,
    filterByUserId,
    searchDemands,
    handlePaginationChange,
    deleteDemand,
    resetFilters,
  } = useDemandStore();

  // 获取位置信息的函数
  const fetchLocationName = async (locationId) => {
    if (!locationId) return '';
    
    // 检查缓存
    if (locationCache[locationId]) {
      return locationCache[locationId];
    }
    
    try {
      const response = await getLocationById(locationId);
      const locationName = response.data?.name || response.name || '';
      
      // 更新缓存
      setLocationCache(prev => ({
        ...prev,
        [locationId]: locationName
      }));
      
      return locationName;
    } catch (error) {
      //console.error('获取位置信息失败:', error);
      return '';
    }
  };

  // 初始化加载当前用户的所有需求
  useEffect(() => {
    const loadMyDemands = async () => {
      if (isLoggedIn) {
        try {
          await filterByUserId(userInfo.id);
        } catch (error) {
          //console.error('加载我的需求失败:', error);
          message.error('加载我的需求失败，请稍后重试');
        }
      } else {
        // 如果用户未登录，跳转到登录页面
        message.warning("请先登录查看您的需求");
        navigate("/login");
      }
    };
    
    loadMyDemands();
  }, [resetFilters, isLoggedIn, userInfo?.id, filterByUserId, navigate]);

  // 当需求列表更新时，获取位置信息
  useEffect(() => {
    const loadLocationNames = async () => {
      if (filteredDemands && filteredDemands.length > 0) {
        const locationIds = filteredDemands
          .filter(demand => demand.locationId && !locationCache[demand.locationId])
          .map(demand => demand.locationId);
        
        if (locationIds.length > 0) {
          for (const locationId of locationIds) {
            await fetchLocationName(locationId);
          }
        }
      }
    };
    
    loadLocationNames();
  }, [filteredDemands]);

  // 处理类型筛选
  const handleTypeChange = (type) => {
    filterByType(type);
  };

  // 处理搜索
  const handleSearch = (value) => {
    searchDemands(value);
  };

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    handlePaginationChange(page, pageSize);
  };

  // 处理查看详情
  const handleViewDetail = (id) => {
    navigate(`/i-need/${id}`);
  };

  // 处理编辑需求（只有PUBLISHED状态的需求可以编辑）
  const handleEdit = (id, status) => {
    if (status !== "PUBLISHED") {
      message.warning("只有PUBLISHED状态的需求可以编辑");
      return;
    }
    navigate(`/i-need/edit/${id}`);
  };

  // 处理删除需求（只有PUBLISHED状态的需求可以删除）
  const handleDelete = (id, status) => {
    if (status !== "PUBLISHED") {
      message.warning("只有PUBLISHED状态的需求可以删除");
      return;
    }
    deleteDemand(id);
    message.success("需求删除成功");
  };

  // 处理创建新需求
  const handleCreate = () => {
    navigate("/i-need/create");
  };

  // 状态标签颜色映射
  const statusColorMap = {
    PUBLISHED: "blue",
    RESPONDED: "orange",
    RESOLVED: "green",
    CANCELLED: "gray",
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        style={{
          padding: "20px",
          background: antdTheme.token.colorBgContainer,
        }}
      >
        <Title
          level={1}
          style={{
            marginBottom: 24,
            textAlign: "center",
            color: antdTheme.token.colorText,
          }}
        >
          我需要的服务
        </Title>

        {/* 筛选和搜索区域 */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
          <Col style={{ width: 200 }}>
            <Select
              value={filterType}
              onChange={handleTypeChange}
              placeholder="选择服务类型"
                              style={{
                  width: "100%",
                  fontSize: 22,
                  fontWeight: 500,
                  color: antdTheme.token.colorText,
                }}
              allowClear
            >
              <Option value="all">所有类型</Option>
              {serviceTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Col>

            <Col style={{ flex: 1 }}>
              <Search
                placeholder="输入关键字搜索"
                allowClear
                enterButton={
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    style={{
                      height: 48,
                      fontSize: 20,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 24,
                      borderBottomRightRadius: 24,
                      width: 60,
                      backgroundColor: antdTheme.token.colorPrimary,
                    }} // 让按钮高度、字体（进而图标大小）匹配
                  />
                }
                value={searchKeyword}
                onChange={(e) => searchDemands(e.target.value)}
                onSearch={handleSearch}
                styles={{
                  affixWrapper: {
                    borderTopLeftRadius: 24,
                    borderBottomLeftRadius: 24,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    paddingLeft: 16,
                  },
                  input: {
                    fontSize: 22,
                    fontWeight: 500,
                    color: antdTheme.token.colorPrimary,
                  },
                }}
              />
            </Col>

            <Col style={{ width: 150, marginRight: 30 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                style={{
                  height: 48,
                  fontSize: 20,
                  borderRadius: 24,
                  width: 150,
                  backgroundColor: antdTheme.token.colorPrimary,
                }} // 让按钮高度、字体（进而图标大小）匹配
              >
                创建需求
              </Button>
            </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: antdTheme.token.colorPrimary }}>
                {filteredDemands.length}
              </Title>
              <div>我的需求总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: antdTheme.token.colorSuccess }}>
                {filteredDemands.filter((d) => d.status === "已完成").length}
              </Title>
              <div>已完成需求</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: antdTheme.token.colorWarning }}>
                {filteredDemands.filter((d) => d.status === "处理中").length}
              </Title>
              <div>处理中需求</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: antdTheme.token.colorPrimary }}>
                {filteredDemands.filter((d) => d.status === "待处理").length}
              </Title>
              <div>待处理需求</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 需求列表 - 卡片瀑布流 */}
      <Card>
        <Spin spinning={loading} tip="加载中...">
          {filteredDemands.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredDemands.map((demand) => (
                <Col key={demand.id} xs={24} sm={12} md={8} lg={8} xl={6}>
                  <Card
                    hoverable
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{demand.title}</span>
                        <Tag color={statusColorMap[demand.status]}>
                          {demand.status}
                        </Tag>
                      </div>
                    }
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        style={{
                          height: 32,
                          backgroundColor: antdTheme.token.colorPrimary,
                          color: antdTheme.token.colorBgContainer,
                          fontSize: 16,
                          borderRadius: 12,
                          lineHeight: "32px",
                        }}
                        onClick={() => handleViewDetail(demand.id)}
                      >
                        查看
                      </Button>,
                      ...(demand.userId === userInfo?.id ? [
                        <Button
                          key="edit"
                          type="default"
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => handleEdit(demand.id, demand.status)}
                          disabled={demand.status !== "PUBLISHED"}
                          style={{
                            height: 32,
                            backgroundColor: antdTheme.token.colorSuccess,
                            color: antdTheme.token.colorBgContainer,
                            fontSize: 16,
                            borderRadius: 12,
                            lineHeight: "32px",
                          }}
                        >
                          编辑
                        </Button>,
                        <Button
                          key="delete"
                          type="danger"
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleDelete(demand.id, demand.status)}
                          disabled={demand.status !== "PUBLISHED"}
                          style={{
                            height: 32,
                            backgroundColor: antdTheme.token.colorError,
                            color: antdTheme.token.colorBgContainer,
                            fontSize: 16,
                            borderRadius: 12,
                            lineHeight: "32px",
                            border: "none",
                          }}
                        >
                          删除
                        </Button>
                      ] : [])
                    ]}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <strong>服务类型:</strong> {demand.type}
                    </div>
                    <div style={{ marginBottom: 8, minHeight: 60 }}>
                      <strong>需求描述:</strong> {demand.description}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>地址:</strong> {
                        demand.locationId ? (
                          locationCache[demand.locationId] || '加载中...'
                        ) : (
                          demand.address || '暂无地址'
                        )
                      }
                    </div>
                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: "12px",
                        color: "#999",
                      }}
                    >
                      <strong>创建时间:</strong> {formatTime(demand.createTime, 'YYYY-MM-DD HH:mm:ss')}
                    </div>
      <div
        style={{
          fontSize: "12px",
          color: antdTheme.token.colorTextSecondary,
          marginTop: "auto",
        }}
      >
        <strong>更新时间:</strong> {formatTime(demand.updateTime, 'YYYY-MM-DD HH:mm:ss')}
      </div>
    </Card>
  </Col>
))}
</Row>
) : (
<div style={{ textAlign: "center", padding: "40px" }}>
  <Typography.Text type="secondary">您还没有发布任何需求</Typography.Text>
  <Button
    type="primary"
    icon={<PlusOutlined />}
    style={{ marginTop: 16 }}
    onClick={handleCreate}
  >
    发布第一个需求
  </Button>
</div>
)}
        </Spin>
        </Card>

        {/* 说明 */}
        <Divider />
        <div style={{ textAlign: "center", color: antdTheme.token.colorTextSecondary }}>
          <Typography.Text>
            您可以查看、编辑和删除您发布的需求
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">
            注意：只有状态为"待处理"的需求可以编辑和删除
          </Typography.Text>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default INeed;