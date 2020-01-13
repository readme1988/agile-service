import React, {
  Component, useState, useEffect, useImperativeHandle,
} from 'react';
import {
  Form, Input, Select, Button, DatePicker, Icon,
} from 'choerodon-ui';
import { Content, stores, axios } from '@choerodon/boot';
import _ from 'lodash';
import SelectFocusLoad from '../../../../../components/SelectFocusLoad';
import { NumericInput } from '../../../../../components/CommonComponent';

const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

const arrOperation1 = [
  {
    value: '=',
    text: '等于',
  },
  {
    value: '!=',
    text: '不等于',
  },
  {
    value: 'in',
    text: '包含',
  },
  {
    value: 'notIn',
    text: '不包含',
  },
];
const arrOperation2 = [
  ...arrOperation1,
  {
    value: 'is',
    text: '是',
  },
  {
    value: 'isNot',
    text: '不是',
  },
];

const arrOperation3 = [
  {
    value: '>',
    text: '大于',
  },
  {
    value: '>=',
    text: '大于或等于',
  },
  {
    value: '<',
    text: '小于',
  },
  {
    value: '<=',
    text: '小于或等于',
  },
];
const arrOperation4 = [
  ...arrOperation3,
  {
    value: '=',
    text: '等于',
  },
  {
    value: 'is',
    text: '是',
  },
  {
    value: 'isNot',
    text: '不是',
  },
];

const OPERATION_FILTER = {
  assignee: arrOperation2,
  priority: arrOperation1,
  issue_type: arrOperation1,
  status: arrOperation1,
  reporter: arrOperation2,
  created_user: arrOperation2,
  last_updated_user: arrOperation2,
  epic: arrOperation2,
  sprint: arrOperation2,
  label: arrOperation2,
  component: arrOperation2,
  influence_version: arrOperation2,
  fix_version: arrOperation2,
  creation_date: arrOperation3,
  last_update_date: arrOperation3,
  story_point: arrOperation4,
  remain_time: arrOperation4,
};

const CreateFilter = (props) => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState([
    {
      prop: undefined,
      rule: undefined,
      value: undefined,
    },
  ]);
  const [quickFilterFiled, setQuickFilterFiled] = useState([]);
  const [deleteItem, setDeleteItem] = useState([]);
  const [temp, setTemp] = useState([]);
  const [page, setPage] = useState(1);

  const { form, onCancel } = props;
  const { getFieldDecorator } = form;

  /**
   * 根据值和属性转化值
   * @param value
   * @param filter
   * @returns {*}
   */
  const getValue = (value, filter) => {
    const type = Object.prototype.toString.call(value);
    // priority和issue_type的值存在数字和数组两种形式
    if (filter === 'priority') {
      if (type === '[object Array]') {
        const v = _.map(value, 'key');
        const vv = v.map(e => `${e}`);
        return `(${vv.join(',')})`;
      } else {
        const v = value.key;
        return `${v}`;
      }
    } else if (filter === 'issue_type') {
      if (type === '[object Array]') {
        const v = _.map(value, 'key');
        const vv = v.map(e => `'${e}'`);
        return `(${vv.join(',')})`;
      } else {
        const v = value.key;
        return `'${v}'`;
      }
    } else if (type === '[object Array]') {
      const v = _.map(value, 'key');
      return `(${v.join(',')})`;
    } else if (type === '[object Object]') {
      if (value.key) {
        const v = value.key;
        if (Object.prototype.toString.call(v) === '[object Number]') {
          return v;
        } else if (Object.prototype.toString.call(v) === '[object String]') {
          return v;
        }
      } else {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
    } else {
      return value;
    }
    return '';
  };

  /**
   * 根据值获取名称
   * @param value
   * @returns {*}
   */
  const getLabel = (value) => {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      const v = _.map(value, 'label');
      return `[${v.join(',')}]`;
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      if (value.key) {
        const v = value.label;
        if (Object.prototype.toString.call(v) === '[object Number]') {
          return v;
        } else if (Object.prototype.toString.call(v) === '[object String]') {
          return v;
        }
      } else {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
    } else {
      return value;
    }
    return '';
  };

  /**
   * 字段的关系列表
   * @param filter
   * @returns {*|Array}
   */
  const getOperation = filter => OPERATION_FILTER[filter] || [];

  /**
   * 调用接口，获取'属性'的值列表
   * @param filter 属性
   * @param addEmpty
   */
  const getOption = (filter, addEmpty, newPage = 1) => {
    const projectId = AppState.currentMenuType.id;
    const OPTION_FILTER = {
      assignee: {
        url: `/base/v1/projects/${projectId}/users?page=${newPage}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      priority: {
        url: `/agile/v1/projects/${projectId}/priority/list_by_org`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      status: {
        url: `/agile/v1/projects/${projectId}/schemes/query_status_by_project_id?apply_type=agile`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      reporter: {
        url: `/base/v1/projects/${projectId}/users?page=${newPage}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/base/v1/projects/${projectId}/users?page=${newPage}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/base/v1/projects/${projectId}/users?page=${newPage}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      epic: {
        url: `/agile/v1/projects/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
      },
      sprint: {
        // post
        url: `/agile/v1/projects/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
      },
      label: {
        url: `/agile/v1/projects/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
      },
      component: {
        url: `/agile/v1/projects/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
      },
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      issue_type: {
        url: `/agile/v1/projects/${projectId}/schemes/query_issue_types?apply_type=agile`,
        prop: '',
        id: 'typeCode',
        name: 'name',
      },
    };
    axios[filter === 'sprint'
      || filter === 'influence_version'
      || filter === 'fix_version' ? 'post' : 'get'](OPTION_FILTER[filter].url)
      .then((res) => {
        setTemp(OPTION_FILTER[filter].prop === '' ? res : res[OPTION_FILTER[filter].prop]);
      });
  };

  /**
   * 加载属性列表
   */
  const loadQuickFilterFiled = () => {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/fields`)
      .then((res) => {
        setQuickFilterFiled(res);
      });
  };

  /**
 * 转化关系
 * @param value
 * @returns {*}
 */
  const transformOperation = (value) => {
    const OPERATION = {
      '=': '=',
      '!=': '!=',
      in: 'in',
      notIn: 'not in',
      is: 'is',
      isNot: 'is not',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
    };
    return OPERATION[value];
  };

  /**
   * 保存配置
   * @param e
   */
  const handleOk = () => {
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const arr = []; // 属性-关系-值
        const expressQueryArr = []; // 列表显示
        const o = []; // 多个条件间关系
        const f = filters.slice();
        f.forEach((v, i) => {
          if (deleteItem.indexOf(i) !== -1) {
            return;
          }
          const a = {
            fieldCode: values[`filter-${i}-prop`],
            operation: transformOperation(values[`filter-${i}-rule`]),
            value: getValue(values[`filter-${i}-value`], values[`filter-${i}-prop`]),
          };
          // 如果不是第一项
          if (i) {
            o.push(values[`filter-${i}-ao`]);
            expressQueryArr.push(values[`filter-${i}-ao`].toUpperCase());
          }
          arr.push(a);
          expressQueryArr.push(_.find(quickFilterFiled, { fieldCode: a.fieldCode }).name);
          expressQueryArr.push(a.operation);
          expressQueryArr.push(getLabel(values[`filter-${i}-value`]));
        });
        const json = JSON.stringify({
          arr,
          o,
        });
        const obj = {
          childIncluded: true,
          expressQuery: expressQueryArr.join(' '),
          name: values.name.trim(),
          description: `${values.description || ''}+++${json}`,
          projectId: AppState.currentMenuType.id,
          quickFilterValueVOList: arr,
          relationOperations: o,
        };
        setLoading(true);
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`, obj)
          .then((res) => {
            setLoading(false);
            props.onOk();
            props.modal.close();
          });
      }
    });
    return false;
  };


  /**
   *校验快速搜索名称是否重复
   *
   * @memberof AddComponent
   */
  const checkSearchNameRepeat = (rule, value, callback) => {
    if (value && value.trim()) {
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/check_name?quickFilterName=${value}`)
        .then((res) => {
          if (res) {
            callback('快速搜索名称重复');
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  };

  /**
   *
   * @param filter
   * @param addEmpty
   * @returns {Array}
   */
  const tempOption = (filter, addEmpty) => {
    const projectId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    const OPTION_FILTER = {
      assignee: {
        url: `/base/v1/projects/${projectId}/users?page=${page}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      priority: {
        url: `/agile/v1/projects/${projectId}/priority/list_by_org`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      status: {
        url: `/agile/v1/projects/${projectId}/schemes/query_status_by_project_id?apply_type=agile`,
        prop: '',
        id: 'id',
        name: 'name',
      },
      reporter: {
        url: `/base/v1/projects/${projectId}/users?page=${page}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      created_user: {
        url: `/base/v1/projects/${projectId}/users?page=${page}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      last_updated_user: {
        url: `/base/v1/projects/${projectId}/users?page=${page}&size=20`,
        prop: 'list',
        id: 'id',
        name: 'realName',
      },
      epic: {
        url: `/agile/v1/projects/${projectId}/issues/epics/select_data`,
        prop: '',
        id: 'issueId',
        name: 'epicName',
      },
      sprint: {
        // post
        url: `/agile/v1/projects/${projectId}/sprint/names`,
        prop: '',
        id: 'sprintId',
        name: 'sprintName',
      },
      label: {
        url: `/agile/v1/projects/${projectId}/issue_labels`,
        prop: '',
        id: 'labelId',
        name: 'labelName',
      },
      component: {
        url: `/agile/v1/projects/${projectId}/component`,
        prop: '',
        id: 'componentId',
        name: 'name',
      },
      influence_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      fix_version: {
        // post
        url: `/agile/v1/projects/${projectId}/product_version/names`,
        prop: '',
        id: 'versionId',
        name: 'name',
      },
      issue_type: {
        url: '',
        prop: '',
        id: 'typeCode',
        name: 'name',
      },
    };
    const arr = temp.map(v => (
      <Option key={v[OPTION_FILTER[filter].id]} value={v[OPTION_FILTER[filter].id]}>
        {v[OPTION_FILTER[filter].name]}
      </Option>
    ));
    return arr;
  };

  /**
   * 根据'属性'获取'关系'列表
   * @param filter
   * @param index
   * @returns {XML}
   */
  const renderOperation = (filter, index) => {
    // const { form } = props;
    if (!filter) {
      return (
        <Select label="关系" />
      );
    } else {
      return (
        <Select
          label="关系"
          style={['in', 'notIn'].indexOf(form.getFieldValue(`filter-${index}-prop`)) > -1 ? { marginTop: 8 } : {}}
          onChange={() => {
            const str = `filter-${index}-value`;
            form.setFieldsValue({
              [str]: undefined,
            });
          }}
        >
          {
            getOperation(filter).map(v => (
              <Option key={v.value} value={v.value}>{v.text}</Option>
            ))
          }
        </Select>
      );
    }
  };

  /**
   * 根据'属性'和'关系'获取'值'列表
   * @param filter
   * @param operation
   * @returns {XML}
   */
  const renderValue = (filter, operation) => {
    if (!filter || !operation) {
      return (
        <Select label="值" />
      );
    } else if (['assignee', 'reporter', 'created_user',
      'last_updated_user'].indexOf(filter) > -1) {
      if (['=', '!='].indexOf(operation) > -1) {
        // return normal value
        return (
          <SelectFocusLoad
            label="值"
            type="user"
            labelInValue
            render={user => (
              <Option key={user.id} value={user.id}>
                {user.realName}
              </Option>
            )}
          />
        );
      } else if (['is', 'isNot'].indexOf(operation) > -1) {
        // return value add empty
        return (
          <Select
            label="值"
            labelInValue
            filter
            optionFilterProp="children"
            dropdownClassName="hidden-text hidden-label"
            filterOption={(input, option) => option.props.children.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0}
          >
            <Option key="'null'" value="'null'">
              空
            </Option>
          </Select>
        );
      } else {
        // return multiple value
        return (
          <SelectFocusLoad label="值" type="user" mode="multiple" labelInValue />
        );
      }
    } else if (
      ['priority', 'status',
        'epic', 'sprint', 'label', 'component',
        'influence_version', 'fix_version', 'issue_type'].indexOf(filter) > -1) {
      if (['=', '!='].indexOf(operation) > -1) {
        // return normal value
        return (
          <Select
            label="值"
            labelInValue
            filter
            dropdownClassName="hidden-text hidden-label"
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0}
            onFocus={() => {
              getOption(filter, false, page);
            }}
          >
            {tempOption(filter, false)}
          </Select>
        );
      } else if (['is', 'isNot'].indexOf(operation) > -1) {
        // return value add empty
        return (
          <Select
            label="值"
            labelInValue
            filter
            dropdownClassName="hidden-text hidden-label"
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0}
          >
            <Option key="'null'" value="'null'">
              空
            </Option>
          </Select>
        );
      } else {
        // return multiple value
        return (
          <Select
            label="值"
            labelInValue
            mode="multiple"
            filter
            dropdownClassName="hidden-text hidden-label"
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0}
            onFocus={() => {
              getOption(filter, false);
            }}
          >
            {tempOption(filter, false)}
          </Select>
        );
      }
    } else if (['creation_date', 'last_update_date'].indexOf(filter) > -1) {
      // time
      // return data picker
      return (
        <DatePicker
          style={{ width: '100%' }}
          label="值"
          format="YYYY-MM-DD HH:mm:ss"
          showTime
        />
      );
    } else {
      // story points && remainning time
      // return number input
      return (operation === 'is' || operation === 'isNot'
        ? (
          <Select
            label="值"
            labelInValue
            filter
            dropdownClassName="hidden-text hidden-label"
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0}
          >
            <Option key="'null'" value="'null'">
              空
            </Option>
          </Select>
        )
        : (
          <NumericInput
            label="值"
            style={{ width: '100%' }}
          // style={{ lineHeight: '22px', marginBottom: 0, width: 300 }}
          />
        )
      );
    }
  };

  useEffect(loadQuickFilterFiled, []);

  useImperativeHandle(props.forwardref, () => (
    {
      handleSubmit: handleOk,
    }));

  return (
    <Form layout="vertical">
      <FormItem style={{ width: 520 }}>
        {getFieldDecorator('name', {
          rules: [{
            required: true,
            message: '名称必填',
            whitespace: true,
          }, {
            validator: checkSearchNameRepeat,
          }],
        })(
          <Input
            label="名称"
            maxLength={10}
          />,
        )}
      </FormItem>
      {
        filters.map((filter, index) => (
          <div key={index.toString()}>
            {
              deleteItem.indexOf(index) === -1 && (
                <div>
                  {
                    index !== 0 && (
                      <FormItem style={{
                        width: 80, display: 'inline-block', marginRight: 10,
                      }}
                      >
                        {getFieldDecorator(`filter-${index}-ao`, {
                          rules: [{
                            required: true,
                            message: '关系不可为空',
                          }],
                        })(
                          <Select label="关系">
                            <Option key="and" value="and">且</Option>
                            <Option key="or" value="or">或</Option>
                          </Select>,
                        )}
                      </FormItem>
                    )
                  }
                  <FormItem style={{
                    width: index === 0 ? 210 : 120, display: 'inline-block', marginRight: 10,
                  }}
                  >
                    {getFieldDecorator(`filter-${index}-prop`, {
                      rules: [{
                        required: true,
                        message: '属性不可为空',
                      }],
                    })(
                      <Select
                        label="属性"
                        onChange={() => {
                          form.setFieldsValue({
                            [`filter-${index}-rule`]: undefined,
                            [`filter-${index}-value`]: undefined,
                          });
                        }}
                      >
                        {
                          quickFilterFiled.map(v => (
                            <Option key={v.fieldCode} value={v.fieldCode}>{v.name}</Option>
                          ))
                        }
                      </Select>,
                    )}
                  </FormItem>
                  <FormItem style={{
                    width: 100, display: 'inline-block', marginRight: 10,
                  }}
                  >
                    {getFieldDecorator(`filter-${index}-rule`, {
                      rules: [{
                        required: true,
                        message: '关系不可为空',
                      }],
                    })(
                      renderOperation(form.getFieldValue(`filter-${index}-prop`), index),
                    )}
                  </FormItem>
                  <FormItem style={{ width: 190, display: 'inline-block' }}>
                    {getFieldDecorator(`filter-${index}-value`, {
                      rules: [{
                        required: true,
                        message: '值不可为空',
                      }],
                    })(
                      renderValue(form.getFieldValue(`filter-${index}-prop`), form.getFieldValue(`filter-${index}-rule`)),
                    )}
                  </FormItem>
                  <Button
                    style={{ margin: 10 }}
                    shape="circle"
                    icon="delete"
                    onClick={() => {
                      const arr = deleteItem.slice();
                      arr.push(index);
                      setDeleteItem(arr);
                    }}
                    disabled={(filters.length - deleteItem.length) < 2}
                  />
                </div>
              )
            }
          </div>
        ))
      }
      <Button
        style={{ margin: '-10px 0 10px' }}
        type="primary"
        funcType="flat"
        onClick={() => {
          const arr = filters.slice();
          arr.push({
            prop: undefined,
            rule: undefined,
            value: undefined,
          });
          setFilters(arr);
        }}
      >
        <Icon type="add icon" />
        添加筛选
      </Button>
      <FormItem style={{ width: 520 }}>
        {getFieldDecorator('description', {})(
          <Input label="描述" autosize maxLength={30} />,
        )}
      </FormItem>
    </Form>
  );
};

export default Form.create()(CreateFilter);
