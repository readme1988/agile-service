import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Modal, Form, Input, DatePicker,
} from 'choerodon-ui';
import moment from 'moment';
import { Content, stores } from '@choerodon/boot';
import ReleaseStore from '../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const { TextArea } = Input;
const FormItem = Form.Item;
const { AppState } = stores;

@observer
class EditRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      expectReleaseDate: null,
      loading: false,
    };
  }

  componentWillMount() {
    this.setState({
      startDate: ReleaseStore.getVersionDetail.startDate ? moment(ReleaseStore.getVersionDetail.startDate, 'YYYY-MM-DD HH:mm:ss') : null,
      expectReleaseDate: ReleaseStore.getVersionDetail.expectReleaseDate ? moment(ReleaseStore.getVersionDetail.expectReleaseDate, 'YYYY-MM-DD HH:mm:ss') : null,
    });
  }

  handleOk = (e) => {
    e.preventDefault();
    const {
      form, onCancel, refresh, data,
    } = this.props;
    form.validateFields((err, value, modify) => {
      if (!err && modify) {
        this.setState({
          loading: true,
        });
        const newData = {
          description: value.description,
          name: value.name.trim(),
          objectVersionNumber: data.objectVersionNumber,
          projectId: AppState.currentMenuType.id,
          startDate: value.startDate ? `${moment(value.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          expectReleaseDate: value.expectReleaseDate ? `${moment(value.expectReleaseDate).format('YYYY-MM-DD')} 00:00:00` : null,
          versionId: ReleaseStore.getVersionDetail.versionId,
        };
        ReleaseStore.axiosUpdateVersion(
          ReleaseStore.getVersionDetail.versionId, newData,
        ).then((res) => {
          this.setState({
            loading: false,
          });
          onCancel();
          refresh();
        }).catch((error) => {
          this.setState({
            loading: false,
          });
        });
      } else if (!modify) {
        onCancel();
      }
    });
  };

  checkName = (rule, value, callback) => {
    const proId = AppState.currentMenuType.id;
    const data = JSON.parse(JSON.stringify(ReleaseStore.getVersionDetail));
    if (value && value.trim() && data.name !== value.trim()) {
      ReleaseStore.axiosCheckName(proId, value.trim()).then((res) => {
        if (res) {
          callback('版本名称重复');
        } else {
          callback();
        }
      }).catch((error) => {
      });
    } else {
      callback();
    }
  };

  render() {
    const { loading, expectReleaseDate, startDate } = this.state;
    const { form, visible, onCancel } = this.props;
    const { getFieldDecorator } = form;
    const data = JSON.parse(JSON.stringify(ReleaseStore.getVersionDetail));
    this.state.startDate = ReleaseStore.getVersionDetail.startDate ? moment(ReleaseStore.getVersionDetail.startDate, 'YYYY-MM-DD HH:mm:ss') : null;
    return (
      <Sidebar
        title="修改发布计划"
        visible={visible}
        onCancel={onCancel.bind(this)}
        destroyOnClose
        okText="确定"
        cancelText="取消"
        onOk={this.handleOk.bind(this)}
        confirmLoading={loading}
        width={380}
      >
        {
          visible ? (
            <Form>
              <FormItem>
                {getFieldDecorator('name', {
                  initialValue: data.name ? data.name : null,
                  rules: [{
                    required: true,
                    message: '版本名称必填',
                    whitespace: true,
                  }, {
                    validator: this.checkName,
                  }],
                })(
                  <Input label="版本名称" maxLength={15} />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('startDate', {
                  initialValue: data.startDate ? moment(data.startDate, 'YYYY-MM-DD HH-mm-ss') : null,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="开始日期"
                    placeholder="请选择开始日期"
                    disabledDate={expectReleaseDate
                      ? current => current > moment(expectReleaseDate) : () => false}
                    onChange={(date) => {
                      this.setState({
                        startDate: date,
                      });
                    }}
                  />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('expectReleaseDate', {
                  initialValue: data.expectReleaseDate ? moment(data.expectReleaseDate, 'YYYY-MM-DD HH-mm-ss') : null,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    label="预计发布日期"
                    placeholder="请选择预计发布日期"
                    disabledDate={startDate
                      ? current => current < moment(startDate) : () => false}
                    onChange={(date) => {
                      this.setState({
                        expectReleaseDate: date,
                      });
                    }}
                  />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('description', {
                  initialValue: data.description ? data.description : null,
                })(
                  <TextArea label="版本描述" autosize={{ minRows: 3, maxRows: 10 }} maxLength={30} />,
                )}
              </FormItem>
            </Form>
          ) : ''
        }
      </Sidebar>
    );
  }
}

export default Form.create()(EditRelease);
