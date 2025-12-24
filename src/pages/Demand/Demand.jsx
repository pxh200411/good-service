import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  Input,
  Table,
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
} from "@ant-design/icons";
import ConfigProvider from "antd/es/config-provider";
import { useDemandStore } from "../../store/modules/demandStore";
import { useUserStore } from "../../store/modules/userStore";
import antdTheme from "../../config/theme";
import styled from "styled-components";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 24px;
    font-size: 22px;
    font-weight: 500;
    color: antdTheme.token.colorText;
  }
`;

const Demand = () => {
  const navigate = useNavigate();

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
    fetchAllDemands,
    fetchServiceTypes,
  } = useDemandStore();

  // 初始化加载所有需求和服务类型，并根据用户登录状态筛选
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchAllDemands(),
        fetchServiceTypes()
      ]);
      resetFilters();
    };
    loadData();
  }, [resetFilters, isLoggedIn, userInfo?.id, filterByUserId, fetchAllDemands, fetchServiceTypes]);

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
    // 如果用户未登录且要跳转到第二页或之后的页面，则重定向到登录页面
    if (!isLoggedIn && page > 1) {
      message.warning("请先登录查看更多内容");
      navigate("/login");
      return;
    }

    handlePaginationChange(page, pageSize);
  };

  // 处理查看详情
  const handleViewDetail = (id) => {
    navigate(`/demand/${id}`);
  };


  // 处理创建新需求
  const handleCreate = () => {
    navigate("/demand/create");
  };

  // 状态标签颜色映射
  const statusColorMap = {
    PUBLISHED: antdTheme.token.colorPrimary,    // 刚发布 - 蓝色
    RESPONDED: antdTheme.token.colorWarning,    // 已响应 - 橙色
    RESOLVED: antdTheme.token.colorSuccess,     // 已完成 - 绿色
    CANCELLED: '#999999',                       // 已取消 - 灰色
  };

  // 分页配置
  const paginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    onChange: handlePageChange,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total, range) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
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
          好服务大厅
        </Title>

        {/* 筛选和搜索区域 */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[32, 16]} align="middle">
            <Col style={{ width: "200px" }}>
              <Select
                value={filterType}
                onChange={handleTypeChange}
                placeholder="选择服务类型"
                allowClear
                className="custom-select"
                style={{
                  width: "100%",
                  fontSize: 22,
                  fontWeight: 500,
                  color: antdTheme.token.colorText,
                }}
              >
                <Option value="all">所有类型</Option>
                {serviceTypes && serviceTypes.map((type) => (
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
          </Row>
        </Card>

        {/* 统计信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={3}
                  style={{ margin: 0, color: antdTheme.token.colorPrimary }}
                >
                  {filteredDemands ? filteredDemands.length : 0}
                </Title>
                <div>当前展示需求数</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={3}
                  style={{ margin: 0, color: antdTheme.token.colorSuccess }}
                >
                  {filteredDemands ? filteredDemands.filter((d) => d.status === "RESOLVED").length : 0}
                </Title>
                <div>已完成需求数</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={3}
                  style={{ margin: 0, color: antdTheme.token.colorWarning }}
                >
                  {filteredDemands ? filteredDemands.filter((d) => d.status === "RESPONDED").length : 0}
                </Title>
                <div>处理中需求数</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 需求列表 - 卡片瀑布流 */}
        <Card>
          <Spin spinning={loading} tip="加载中...">
            {filteredDemands && filteredDemands.length > 0 ? (
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
                          <Tag color="default" style={{ backgroundColor: '#f0f0f0' }}>
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
                      </Button>
                    ]}
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <strong>服务ID:</strong> {demand.originalData?.serviceId || '未知'}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>服务类型:</strong> {demand.type}
                      </div>
                      <div style={{ marginBottom: 8, minHeight: 60 }}>
                        <strong>需求描述:</strong> {demand.description}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>位置ID:</strong> {demand.originalData?.locationId || '未知'}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>地址:</strong> {demand.address}
                      </div>
                      <div
                        style={{
                          marginBottom: 8,
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        <strong>开始时间:</strong>{" "}
                        {demand.originalData?.startTime ? 
                          new Date(demand.originalData.startTime.seconds * 1000).toLocaleString() : 
                          '未设置'
                        }
                      </div>
                      <div
                        style={{
                          marginBottom: 8,
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        <strong>结束时间:</strong>{" "}
                        {demand.originalData?.endTime ? 
                          new Date(demand.originalData.endTime.seconds * 1000).toLocaleString() : 
                          '未设置'
                        }
                      </div>
                      <div
                        style={{
                          marginBottom: 8,
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        <strong>创建时间:</strong>{" "}
                        {new Date(demand.createTime).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          marginTop: "auto",
                        }}
                      >
                        <strong>更新时间:</strong>{" "}
                        {new Date(demand.updateTime).toLocaleString()}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Typography.Text type="secondary">暂无需求数据</Typography.Text>
              </div>
            )}
            {/* 分页 */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <div style={{ display: "inline-block" }}>
                <Table
                  pagination={paginationConfig}
                  dataSource={[]}
                  columns={[]}
                  rowKey="id"
                  style={{ display: "none" }}
                />
                <div style={{ marginTop: 10 }}>
                  <Typography.Text>
                    第 {pagination.current}-
                    {Math.min(
                      pagination.current * pagination.pageSize,
                      pagination.total
                    )}{" "}
                    条，共 {pagination.total} 条
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Spin>
        </Card>

        {/* 说明 */}
        <Divider />
        <div style={{ textAlign: "center", color: "#999" }}>
          <Typography.Text>
            使用筛选和搜索功能查找特定需求，点击查看按钮查看详情
          </Typography.Text>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Demand;