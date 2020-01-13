import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Modal, Form, Input,
} from 'choerodon-ui';
import { stores, axios, Choerodon } from '@choerodon/boot';
import _ from 'lodash';
import IssueStore from '@/stores/project/sprint/IssueStore';

const { AppState } = stores;
const FormItem = Form.Item;
@observer
class SaveFilterModal extends Component {
  checkMyFilterNameRepeat = filterName => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/check_name?userId=${AppState.userInfo.id}&name=${filterName}`)

  checkMyFilterNameRepeatCreating = (rule, value, callback) => {
    this.checkMyFilterNameRepeat(value).then((res) => {
      if (res) {
        // Choerodon.prompt('筛选名称重复');
        callback('筛选名称重复');
      } else {
        callback();
      }
    });
  }

  handleSaveFilterOk = () => {
    const { form, dataSet } = this.props;
    form.validateFields(['filterName'], (err, value) => {
      if (!err) {
        const {
          issueTypeId, assigneeId, statusId, issueIds, quickFilterIds,
          reporterIds,
          sprint,
          createStartDate, createEndDate, contents,
          component, version,
        } = dataSet.queryDataSet.current.toData();
        const searchDTO = { 
          advancedSearchArgs: {
            issueTypeId,              
            statusId,        
            reporterIds,      
          },
          otherArgs: {
            issueIds,
            assigneeId,
            sprint,
            component, 
            version,
          },
          searchArgs: {
            createStartDate,
            createEndDate,
          },
          quickFilterIds,
          contents, 
        };
        const data = {
          name: value.filterName,
          filterJson: JSON.stringify(searchDTO),
          personalFilterSearchVO: searchDTO,
        };
        IssueStore.setLoading(true);
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter`, data)
          .then((res) => {
            IssueStore.axiosGetMyFilterList();
            IssueStore.setSaveFilterVisible(false);
            form.setFieldsValue({ filterName: '' });
            Choerodon.prompt('保存成功');
          }).catch(() => {
            IssueStore.setLoading(false);
            Choerodon.prompt('保存失败');
          });
      }
    });
  }

  render() {
    const saveFilterVisible = IssueStore.getSaveFilterVisible;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title="保存筛选"
        visible={saveFilterVisible}
        onOk={this.handleSaveFilterOk}
        onCancel={() => {
          form.setFieldsValue({ filterName: '' });
          IssueStore.setSaveFilterVisible(false);
        }}
      >
        <Form className="c7n-filterNameForm">
          <FormItem>
            {getFieldDecorator('filterName', {
              rules: [{
                required: true, message: '请输入筛选名称',
              }, { validator: this.checkMyFilterNameRepeatCreating }],
              validateTrigger: 'onChange',
            })(
              <Input
                label="筛选名称"
                maxLength={10}
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(SaveFilterModal);
