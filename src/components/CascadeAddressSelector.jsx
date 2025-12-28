import React, { useState, useEffect } from 'react';
import { Select, Row, Col } from 'antd';
import { getProvinces, getCities, getItems } from '../api/modules/location';

const { Option } = Select;

const CascadeAddressSelector = ({ value = {}, onChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    items: false
  });

  const [selectedValues, setSelectedValues] = useState({
    province: value.province || undefined,
    city: value.city || undefined,
    item: value.item || undefined
  });

  // 加载省份列表
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      try {
        const response = await getProvinces();
        if (response) {
          setProvinces(response);
        }
      } catch (error) {
        //console.error('加载省份列表失败:', error);
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  // 当省份选择变化时，加载对应的城市列表
  useEffect(() => {
    const loadCities = async () => {
      if (selectedValues.province) {
        setLoading(prev => ({ ...prev, cities: true }));
        try {
          const response = await getCities(selectedValues.province);
          if (response) {
            setCities(response);
          }
        } catch (error) {
          //console.error('加载城市列表失败:', error);
        } finally {
          setLoading(prev => ({ ...prev, cities: false }));
        }
      } else {
        setCities([]);
        setItems([]);
        setSelectedValues(prev => ({ ...prev, city: undefined, item: undefined }));
      }
    };
    loadCities();
  }, [selectedValues.province]);

  // 当城市选择变化时，加载对应的区县列表
  useEffect(() => {
    const loadItems = async () => {
      if (selectedValues.city) {
        setLoading(prev => ({ ...prev, items: true }));
        try {
          const response = await getItems(selectedValues.city);
          if (response) {
            setItems(response);
          }
        } catch (error) {
          //console.error('加载区县列表失败:', error);
        } finally {
          setLoading(prev => ({ ...prev, items: false }));
        }
      } else {
        setItems([]);
        setSelectedValues(prev => ({ ...prev, item: undefined }));
      }
    };
    loadItems();
  }, [selectedValues.city]);

  // 处理省份选择变化
  const handleProvinceChange = (value) => {
    setSelectedValues({
      province: value,
      city: undefined,
      item: undefined
    });
    
    const selectedProvince = provinces.find(p => p.id === value);
    const addressValue = {
      province: selectedProvince ? selectedProvince.name : '',
      city: '',
      item: '',
      fullAddress: selectedProvince ? selectedProvince.name : ''
    };
    
    onChange && onChange(addressValue);
  };

  // 处理城市选择变化
  const handleCityChange = (value) => {
    setSelectedValues(prev => ({
      ...prev,
      city: value,
      item: undefined
    }));
    
    const selectedProvince = provinces.find(p => p.id === selectedValues.province);
    const selectedCity = cities.find(c => c.id === value);
    const addressValue = {
      province: selectedProvince ? selectedProvince.name : '',
      city: selectedCity ? selectedCity.name : '',
      item: '',
      fullAddress: `${selectedProvince ? selectedProvince.name : ''}${selectedCity ? selectedCity.name : ''}`
    };
    
    onChange && onChange(addressValue);
  };

  // 处理区县选择变化
  const handleItemChange = (value) => {
    const selectedProvince = provinces.find(p => p.id === selectedValues.province);
    const selectedCity = cities.find(c => c.id === selectedValues.city);
    const selectedItem = items.find(i => i.id === value);
    
    const addressValue = {
      province: selectedProvince ? selectedProvince.name : '',
      city: selectedCity ? selectedCity.name : '',
      item: selectedItem ? selectedItem.name : '',
      itemId: selectedItem ? selectedItem.id : undefined, // 添加区县ID
      fullAddress: `${selectedProvince ? selectedProvince.name : ''}${selectedCity ? selectedCity.name : ''}${selectedItem ? selectedItem.name : ''}`
    };
    
    onChange && onChange(addressValue);
  };

  return (
    <Row gutter={[8, 8]}>
      {/* 省份选择 */}
      <Col xs={24} sm={8}>
        <Select
          placeholder="请选择省份"
          value={selectedValues.province}
          onChange={handleProvinceChange}
          loading={loading.provinces}
          style={{ width: '100%' }}
        >
          {provinces.map(province => (
            <Option key={province.id} value={province.id}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Col>

      {/* 城市选择 */}
      <Col xs={24} sm={8}>
        <Select
          placeholder="请选择城市"
          value={selectedValues.city}
          onChange={handleCityChange}
          loading={loading.cities}
          disabled={!selectedValues.province || loading.provinces}
          style={{ width: '100%' }}
        >
          {cities.map(city => (
            <Option key={city.id} value={city.id}>
              {city.name}
            </Option>
          ))}
        </Select>
      </Col>

      {/* 区县选择 */}
      <Col xs={24} sm={8}>
        <Select
          placeholder="请选择区县"
          value={selectedValues.item}
          onChange={handleItemChange}
          loading={loading.items}
          disabled={!selectedValues.city || loading.cities}
          style={{ width: '100%' }}
        >
          {items.map(item => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default CascadeAddressSelector;