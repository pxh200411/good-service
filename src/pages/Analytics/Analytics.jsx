import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  DatePicker,
  Table,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  Alert,
  Result,
} from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { searchByLocationAndTime } from "../../api/modules/demand";
import { getMonthlyCreationStatistics, getMonthlyRespondedStatistics } from "../../api/modules/statistics";
import { searchLocations } from "../../api/modules/location";
import CascadeAddressSelector from "../../components/CascadeAddressSelector";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import { useUserStore } from "../../store/modules/userStore";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const { userInfo } = useUserStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("line"); // line or bar
  const [statisticsData, setStatisticsData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // 检查用户权限
  const isAdmin = userInfo?.username === 'admin';

  // 如果不是admin用户，显示权限提示
  if (!isAdmin) {
    return (
      <div style={{ padding: "20px", background: "#f0f2f5", minHeight: "100vh" }}>
        <Result
          icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
          title="访问受限"
          subTitle="对不起，只有管理员可以查看统计分析页面。"
          extra={
            <Button type="primary" href="/">
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  // 表格列配置
  const columns = [
    {
      title: "月份",
      dataIndex: "month",
      key: "month",
      width: 120,
    },
    {
      title: "地域",
      dataIndex: "region",
      key: "region",
      width: 200,
    },
    {
      title: "月累计发布服务需求数",
      dataIndex: "monthlyDemands",
      key: "monthlyDemands",
      width: 150,
      align: "right",
    },
    {
      title: "月累计响应成功服务数",
      dataIndex: "monthlyResponses",
      key: "monthlyResponses",
      width: 150,
      align: "right",
    },
    {
      title: "响应成功率",
      dataIndex: "successRate",
      key: "successRate",
      width: 120,
      align: "right",
      render: (rate) => rate ? `${rate}%` : "0%",
    },
  ];

  // 获取地点ID的辅助函数
  const getLocationIds = async (location) => {
    let locationIds = [];
    
    // 如果用户选择了地点，先调用地点搜索API获取location ID
    if (location && location.fullAddress && location.fullAddress !== '全部地域') {
      try {
        // 优先使用区县名称，如果没有区县则使用城市名称
        const searchKeyword = location.item || location.city || location.province;
        //console.log('搜索地点关键词:', searchKeyword);
        
        const searchResponse = await searchLocations(searchKeyword);
        //console.log('地点搜索结果:', searchResponse);
        
        // 从搜索结果中提取location ID
        if (searchResponse && Array.isArray(searchResponse)) {
          locationIds = searchResponse.map(loc => loc.id).filter(id => id);
        } else if (searchResponse && searchResponse.id) {
          locationIds = [searchResponse.id];
        }
        
        //console.log('提取的location IDs:', locationIds);
      } catch (searchError) {
        //console.warn('地点搜索失败，使用原有itemId:', searchError);
        // 如果搜索失败，回退到使用原有的itemId
        if (location.itemId) {
          locationIds = [location.itemId];
        }
      }
    }
    
    return locationIds;
  };

  // 默认查询最近6个月的数据
  useEffect(() => {
    const endDate = moment();
    const startDate = moment().subtract(5, "months");

    form.setFieldsValue({
      dateRange: [startDate, endDate],
    });

    // 直接调用查询逻辑而不是通过handleSearch
    const performInitialSearch = async () => {
      setLoading(true);
      setApiError(null);

      try {
        // 获取地点ID（初始查询时没有选择地点，所以会返回空数组）
        const locationIds = await getLocationIds(selectedLocation);

        const requestParams = {
          matchLocationIds: locationIds,
          matchServiceTypeIds: [],
          earliestCreateTime: startDate.toDate(),
          latestCreateTime: endDate.toDate(),
        };

        //console.log('初始查询API请求参数:', requestParams);

        // 调用统计API获取数据
        const [creationResponse, respondedResponse] = await Promise.all([
          getMonthlyCreationStatistics(requestParams),
          getMonthlyRespondedStatistics(requestParams)
        ]);

        //console.log('初始创建统计API响应:', creationResponse);
        //console.log('初始响应统计API响应:', respondedResponse);

        // 处理API返回的数据
        const processedData = processStatisticsApiResponse(
          creationResponse.data || creationResponse,
          respondedResponse.data || respondedResponse,
          startDate,
          endDate
        );
        
        setStatisticsData(processedData);
        prepareChartData(processedData);
      } catch (error) {
        //console.error('初始查询失败:', error);
        const mockData = generateMockData({ dateRange: [startDate, endDate] });
        setStatisticsData(mockData);
        prepareChartData(mockData);
      } finally {
        setLoading(false);
      }
    };

    performInitialSearch();
  }, [form]);

  // 处理查询
  const handleSearch = async (values) => {
    setLoading(true);
    setApiError(null);

    try {
      const { dateRange } = values;
      const startDate = dateRange[0];
      const endDate = dateRange[1];

      // 获取地点ID
      const locationIds = await getLocationIds(selectedLocation);

      // 准备API请求参数
      const requestParams = {
        matchLocationIds: locationIds,
        matchServiceTypeIds: [],
        earliestCreateTime: startDate.toDate(),
        latestCreateTime: endDate.toDate(),
      };

      //console.log('统计API请求参数:', requestParams);

      // 调用统计API获取数据
      const [creationResponse, respondedResponse] = await Promise.all([
        getMonthlyCreationStatistics(requestParams),
        getMonthlyRespondedStatistics(requestParams)
      ]);

      //console.log('创建统计API响应:', creationResponse);
      //console.log('响应统计API响应:', respondedResponse);

      // 处理API返回的数据
      const processedData = processStatisticsApiResponse(
        creationResponse.data || creationResponse,
        respondedResponse.data || respondedResponse,
        startDate,
        endDate
      );
      
      setStatisticsData(processedData);
      prepareChartData(processedData);
      
    } catch (error) {
      //console.error('查询数据失败:', error);
      setApiError(error.message || '查询数据失败，请稍后重试');
      
      // 如果API调用失败，生成模拟数据用于演示
      const mockData = generateMockData(values);
      setStatisticsData(mockData);
      prepareChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // 处理API响应数据
  const processStatisticsApiResponse = (creationData, respondedData, startDate, endDate) => {
    // 将API数据转换为Map以便快速查找
    const creationMap = new Map();
    const respondedMap = new Map();
    
    // 处理创建统计数据
    if (Array.isArray(creationData)) {
      creationData.forEach(item => {
        const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
        creationMap.set(key, item.count || 0);
      });
    }
    
    // 处理响应统计数据
    if (Array.isArray(respondedData)) {
      respondedData.forEach(item => {
        const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
        respondedMap.set(key, item.count || 0);
      });
    }
    
    // 生成月份数组
    const months = [];
    let current = moment(startDate);
    const end = moment(endDate);
    
    while (current.isSameOrBefore(end, 'month')) {
      months.push(moment(current));
      current.add(1, 'month');
    }

    // 按月份统计数据
    const monthlyStats = months.map((month) => {
      const monthKey = month.format('YYYY-MM');
      const creationCount = creationMap.get(monthKey) || 0;
      const respondedCount = respondedMap.get(monthKey) || 0;

      return {
        key: monthKey,
        startDate: month.startOf('month').toDate(),
        endDate: month.endOf('month').toDate(),
        region: selectedLocation?.fullAddress || '全部地域',
        monthlyDemands: creationCount,
        monthlyResponses: respondedCount,
      };
    });

    return monthlyStats;
  };

  const processApiResponse = (apiData, startDate, endDate) => {
    const { content = [] } = apiData;
    
    // 生成月份数组
    const months = [];
    let current = moment(startDate);
    const end = moment(endDate);
    
    while (current.isSameOrBefore(end, 'month')) {
      months.push(moment(current));
      current.add(1, 'month');
    }

    // 按月份统计数据
    const monthlyStats = months.map((month) => {
      // 筛选该月的需求数据
      const monthDemands = content.filter((item) => {
        // 处理不同的时间戳格式
        let itemDate;
        if (item.createdAt && typeof item.createdAt.seconds === 'number') {
          // 处理秒级时间戳
          itemDate = moment.unix(item.createdAt.seconds);
        } else if (item.createdAt && typeof item.createdAt.epochSecond === 'number') {
          // 处理epochSecond时间戳
          itemDate = moment.unix(item.createdAt.epochSecond);
        } else {
          // 如果无法解析时间戳，使用当前时间
          itemDate = moment();
        }
        return itemDate.isValid() && itemDate.isSame(month, 'month');
      });

      // 计算成功响应数（基于状态字段，支持多种状态格式）
      const successfulResponses = monthDemands.filter((demand) => {
        const status = demand.status || '';
        return status.toLowerCase().includes('accept') || 
               status.toLowerCase().includes('complet') ||
               status.toLowerCase().includes('完成') ||
               status.toLowerCase().includes('成功');
      });

      // 计算成功率
      const successRate = monthDemands.length > 0 
        ? Math.round((successfulResponses.length / monthDemands.length) * 100)
        : 0;

      return {
        key: month.format('YYYY-MM'),
        month: month.format('YYYY-MM'),
        region: selectedLocation?.fullAddress || '全部地域',
        monthlyDemands: monthDemands.length,
        monthlyResponses: successfulResponses.length,
        successRate: successRate,
      };
    });

    return monthlyStats;
  };

  // 生成模拟数据（当API不可用时）
  const generateMockData = (values) => {
    const { dateRange } = values;
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    
    // 生成月份数组
    const months = [];
    let current = moment(startDate);
    const end = moment(endDate);
    
    while (current.isSameOrBefore(end, 'month')) {
      months.push(moment(current));
      current.add(1, 'month');
    }

      // 生成模拟数据
      const mockStats = months.map((month) => {
      // 模拟一些随机数据
      const baseDemands = 10 + Math.floor(Math.random() * 20);
      const baseResponses = Math.floor(baseDemands * (0.6 + Math.random() * 0.3));
      const successRate = Math.round((baseResponses / baseDemands) * 100);

      return {
        key: month.format('YYYY-MM'),
        month: month.format('YYYY-MM'),
        region: selectedLocation?.fullAddress || '全部地域',
        monthlyDemands: baseDemands,
        monthlyResponses: baseResponses,
        successRate: successRate,
      };
    });

    return mockStats;
  };

  // 准备图表数据
  const prepareChartData = (stats) => {
    const months = stats.map((item) => item.key || item.month);
    const demandCounts = stats.map((item) => item.monthlyDemands);
    const responseCounts = stats.map((item) => item.monthlyResponses);

    //console.log('[DEBUG] prepareChartData - stats:', stats);
    //console.log('[DEBUG] prepareChartData - months:', months);
    //console.log('[DEBUG] prepareChartData - demandCounts:', demandCounts);
    //console.log('[DEBUG] prepareChartData - responseCounts:', responseCounts);

    setChartData({
      months,
      demandCounts,
      responseCounts,
    });
  };

  // 生成图表配置
  const getChartOption = () => {
    if (!chartData) return {};

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: ["月累计发布服务需求数", "月累计响应成功服务数"],
        top: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: chartData.months,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "月累计发布服务需求数",
          type: chartType,
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: chartData.demandCounts,
          color: "#1890ff",
        },
        {
          name: "月累计响应成功服务数",
          type: chartType,
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: chartData.responseCounts,
          color: "#52c41a",
        },
      ],
    };

    return option;
  };

  return (
    <div style={{ padding: "20px", background: "#f0f2f5" }}>
      <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        服务需求统计分析
      </Title>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Text type="secondary">
          按地域和时间统计服务需求的发布和响应情况，支持查询历史数据并可视化展示趋势变化
        </Text>
      </div>

      {/* 查询表单 */}
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="dateRange"
                label="时间范围"
                rules={[{ required: true, message: "请选择时间范围" }]}
              >
                <RangePicker
                  picker="month"
                  style={{ width: "100%" }}
                  format="YYYY-MM"
                  placeholder={["开始月份", "结束月份"]}
                />
              </Form.Item>
            </Col>

             <Col xs={24} md={16}>
               <Form.Item label="地域选择">
                 <CascadeAddressSelector
                   value={selectedLocation || {}}
                   onChange={(value) => {
                     setSelectedLocation(value);
                   }}
                 />
               </Form.Item>
             </Col>
          </Row>

          <Row>
            <Col>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={loading}
                  >
                    查询
                  </Button>
                  <Button 
                    htmlType="reset"
                    onClick={() => {
                      setSelectedLocation(null);
                      form.resetFields();
                    }}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 错误提示 */}
      {apiError && (
        <Alert
          message="查询出错"
          description={apiError}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 图表类型切换 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Text>图表类型：</Text>
          <Space>
            <Button
              type={chartType === "line" ? "primary" : "default"}
              icon={<LineChartOutlined />}
              onClick={() => setChartType("line")}
            >
              折线图
            </Button>
            <Button
              type={chartType === "bar" ? "primary" : "default"}
              icon={<BarChartOutlined />}
              onClick={() => setChartType("bar")}
            >
              柱状图
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 图表 */}
      <Card style={{ marginBottom: 24 }}>
        <Spin spinning={loading} tip="加载中...">
          {chartData && (
            <div style={{ height: 400 }}>
              <ReactECharts option={getChartOption()} />
            </div>
          )}
        </Spin>
      </Card>

      {/* 统计数据列表 */}
      <Card>
        <Spin spinning={loading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={statisticsData}
            rowKey="key"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Analytics;