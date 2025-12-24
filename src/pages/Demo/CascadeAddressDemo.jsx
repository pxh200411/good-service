import React, { useState } from 'react';
import { Card, Typography, Form, Button, Space } from 'antd';
import CascadeAddressSelector from '../../components/CascadeAddressSelector';

const { Title, Text } = Typography;

const CascadeAddressDemo = () => {
  const [form] = Form.useForm();
  const [selectedAddress, setSelectedAddress] = useState({});

  const handleAddressChange = (addressData) => {
    setSelectedAddress(addressData);
    console.log('地址选择变化:', addressData);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('表单数据:', values);
      alert(`选择的地址: ${values.address?.fullAddress || '未选择'}`);
    });
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title="三级联动地址选择器演示" bordered={true}>
        <Title level={3}>功能说明</Title>
        <Text>
          这是一个三级联动地址选择器，支持省-市-区县的级联选择。
          选择上级选项后，下级选项会自动加载对应的数据。
        </Text>
        
        <div style={{ marginTop: 24 }}>
          <Title level={4}>演示表单</Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              address: {}
            }}
          >
            <Form.Item
              name="address"
              label="地址选择"
              rules={[
                {
                  required: true,
                  validator: (_, value) => {
                    if (!value || !value.fullAddress) {
                      return Promise.reject('请选择完整的地址信息');
                    }
                    return Promise.resolve();
                  },
                  trigger: 'change'
                }
              ]}
            >
              <CascadeAddressSelector onChange={handleAddressChange} />
            </Form.Item>
          </Form>
        </div>

        <div style={{ marginTop: 24 }}>
          <Title level={4}>当前选择结果</Title>
          <Card size="small">
            <pre style={{ margin: 0 }}>
              {JSON.stringify(selectedAddress, null, 2)}
            </pre>
          </Card>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              提交表单
            </Button>
            <Button onClick={() => {
              form.resetFields();
              setSelectedAddress({});
            }}>
              重置
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CascadeAddressDemo;