import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Page, Header, Content, stores, Permission, Breadcrumb,
} from '@choerodon/boot';
import {
  Button, Menu, Icon, Breadcrumb as Bread, Spin, Tooltip,
} from 'choerodon-ui';
import { Action, axios } from '@choerodon/boot';
import { withRouter, Link } from 'react-router-dom';
import DragSortingTable from '../ReleaseComponent/DragSortingTable';
import AddRelease from '../ReleaseComponent/AddRelease';
import ReleaseStore from '../../../stores/project/release/ReleaseStore';
import './ReleaseHome.less';
import EditRelease from '../ReleaseComponent/EditRelease';
import PublicRelease from '../ReleaseComponent/PublicRelease';
import TableDropMenu from '../../../common/TableDropMenu';
import DeleteReleaseWithIssues from '../ReleaseComponent/DeleteReleaseWithIssues';

const { AppState } = stores;
const { Item } = Bread;
const COLOR_MAP = {
  规划中: '#ffb100',
  已发布: '#00bfa5',
  归档: 'rgba(0, 0, 0, 0.3)',
};

@observer
class ReleaseHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editRelease: false,
      addRelease: false,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      selectItem: {},
      versionDelInfo: {},
      publicVersion: false,
      // combineVisible: false,
      loading: false,
      // sourceList: [],
      release: false,
    };
  }

  componentDidMount() {
    const { pagination } = this.state;
    this.refresh(pagination);
  }

  componentWillUnmount() {
    ReleaseStore.setVersionList([]);
  }

  refresh(pagination) {
    this.setState({
      loading: true,
    });
    ReleaseStore.axiosGetVersionList({
      page: pagination.current,
      size: pagination.pageSize,
    }).then((data) => {
      ReleaseStore.setVersionList(data.list);
      this.setState({
        loading: false,
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data.total,
        },
      });
    }).catch((error) => {
    });
  }

  handleClickMenu(record, key) {
    const { pagination } = this.state;
    if (key === '0') {
      if (record.statusCode === 'version_planning') {
        ReleaseStore.axiosGetPublicVersionDetail(record.versionId)
          .then((res) => {
            ReleaseStore.setPublicVersionDetail(res);
            ReleaseStore.setVersionDetail(record);
            this.setState({ publicVersion: true, release: record });
          }).catch((error) => {
          });
      } else {
        ReleaseStore.axiosUnPublicRelease(
          record.versionId,
        ).then((res2) => {
          this.refresh(pagination);
        }).catch((error) => {
        });
      }
    }
    if (key === '4') {
      ReleaseStore.axiosVersionIssueStatistics(record.versionId).then((res) => {
        this.setState({
          versionDelInfo: {
            versionName: record.name,
            versionId: record.versionId,
            ...res,
          },
        }, () => {
          ReleaseStore.setDeleteReleaseVisible(true);
        });
      }).catch((error) => {
      });
    }
    if (key === '5') {
      ReleaseStore.axiosGetVersionDetail(record.versionId).then((res) => {
        ReleaseStore.setVersionDetail(res);
        this.setState({
          selectItem: record,
          editRelease: true,
        });
      }).catch((error) => {
      });
    }
    if (key === '3') {
      if (record.statusCode === 'archived') {
        // 撤销归档
        ReleaseStore.axiosUnFileVersion(record.versionId).then((res) => {
          this.refresh(pagination);
        }).catch((error) => {
        });
      } else {
        // 归档
        ReleaseStore.axiosFileVersion(record.versionId).then((res) => {
          this.refresh(pagination);
        }).catch((error) => {
        });
      }
    }
  }

  handleChangeTable(pagination, filters, sorter, barFilters) {
    const searchArgs = {};
    if (filters && filters.name && filters.name.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      searchArgs.name = filters.name[0];
    }
    if (filters && filters.description && filters.description.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      searchArgs.description = filters.description[0];
    }
    ReleaseStore.setFilters({
      advancedSearchArgs: { statusCodes: filters && filters.key && filters.key.length > 0 ? filters.key : [] },
      searchArgs,
      contents: barFilters,
    });
    this.refresh({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  }

  handleDrag = (res, postData) => {
    const { pagination } = this.state;
    ReleaseStore.setVersionList(res);
    ReleaseStore.handleDataDrag(AppState.currentMenuType.id, postData)
      .then(() => {
        this.refresh(pagination);
      }).catch((error) => {
        this.refresh(pagination);
      });
  };

  renderMenu = (text, record) => {
    const menu = (
      <Menu onClick={e => this.handleClickMenu(record, e.key)}>
        {record.statusCode === 'archived'
          ? null
          : (
            <Menu.Item key="0">
              <Tooltip placement="top" title={record.statusCode === 'version_planning' ? '发布' : '撤销发布'}>
                <span>
                  {record.statusCode === 'version_planning' ? '发布' : '撤销发布'}
                </span>
              </Tooltip>
            </Menu.Item>
          )
        }
        <Menu.Item key="3">
          <Tooltip placement="top" title={record.statusCode === 'archived' ? '撤销归档' : '归档'}>
            <span>
              {record.statusCode === 'archived' ? '撤销归档' : '归档'}
            </span>
          </Tooltip>
        </Menu.Item>
        {record.statusCode === 'archived'
          ? null
          : (
            <Menu.Item key="4">
              <Tooltip placement="top" title="删除">
                <span>
                  删除
                </span>
              </Tooltip>
            </Menu.Item>
          )
        }
      </Menu>
    );
    return (
      <TableDropMenu
        menu={menu}
        text={text}
        onClickEdit={this.handleClickMenu.bind(this, record, '5')}
      />
    );
  };

  render() {
    const {
      loading,
      pagination,
      addRelease,
      editRelease,
      versionDelInfo,
      selectItem,
      publicVersion,
      release,
    } = this.state;
    const deleteReleaseVisible = ReleaseStore.getDeleteReleaseVisible;
    const menu = AppState.currentMenuType;
    const {
      type, id: projectId, organizationId: orgId, name, 
    } = menu;
    const versionData = ReleaseStore.getVersionList.length > 0 ? ReleaseStore.getVersionList : [];
    const versionColumn = [{
      title: '版本',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => this.renderMenu(text, record),
      filters: [],
    }, {
      title: '版本状态',
      dataIndex: 'status',
      key: 'key',
      render: text => (
        <p style={{ marginBottom: 0, minWidth: 60 }}>
          <span
            style={{
              color: '#fff',
              background: COLOR_MAP[text],
              display: 'inline-block',
              lineHeight: '16px',
              height: '16px',
              borderRadius: '2px',
              padding: '0 2px',
              fontSize: '13px',
            }}
          >
            <div style={{ transform: 'scale(.8)' }}>{text === '归档' ? '已归档' : text}</div>
          </span>
        </p>
      ),
      filters: [
        {
          text: '已归档',
          value: 'archived',
        },
        {
          text: '已发布',
          value: 'released',
        },
        {
          text: '规划中',
          value: 'version_planning',
        },
      ],
      filterMultiple: true,
    }, {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: text => (text ? <p style={{ marginBottom: 0, minWidth: 75 }}>{text.split(' ')[0]}</p> : ''),
    }, {
      title: '预计发布日期',
      dataIndex: 'expectReleaseDate',
      key: 'expectReleaseDate',
      render: text => (text ? <p style={{ marginBottom: 0, minWidth: 75 }}>{text.split(' ')[0]}</p> : ''),
    }, {
      title: '实际发布日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: text => (text ? <p style={{ marginBottom: 0, minWidth: 75 }}>{text.split(' ')[0]}</p> : ''),
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: text => (
        <Tooltip mouseEnterDelay={0.5} title={`描述：${text}`}>
          <p style={{
            marginBottom: 0, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
          >
            {text}
          </p>
        </Tooltip>
      ),
      filters: [],
    }];
    return (
      <Page
        service={[
          'agile-service.product-version.releaseVersion',
          'agile-service.product-version.revokeReleaseVersion',
          'agile-service.product-version.revokeArchivedVersion',
          'agile-service.product-version.archivedVersion',
          'agile-service.product-version.deleteVersion',
          'agile-service.product-version.updateVersion',
          'agile-service.product-version.createVersion',
          'agile-service.product-version.mergeVersion',
          'agile-service.product-version.listByProjectId',
          'agile-service.product-version.queryVersionByProjectId',
          'base-service.organization-project.getGroupInfoByEnableProject',
        ]}
      >
        <Header title="版本管理">
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.createVersion']}>
            <Button
              onClick={() => {
                this.setState({
                  addRelease: true,
                });
              }}
              className="leftBtn"
              funcType="flat"
            >
              <Icon type="playlist_add" />
              创建发布版本
            </Button>
          </Permission>
        </Header>
        <Breadcrumb />
        <Content style={{ paddingTop: 0 }}>
          <Spin spinning={loading}>
            <DragSortingTable
              handleDrag={this.handleDrag}
              columns={versionColumn}
              dataSource={versionData}
              pagination={pagination}
              onChange={this.handleChangeTable.bind(this)}
            />
          </Spin>
          {addRelease
            ? (
              <AddRelease
                visible={addRelease}
                onCancel={() => {
                  this.setState({
                    addRelease: false,
                  });
                }}
                refresh={this.refresh.bind(this, pagination)}
              />
            ) : ''
          }
          <DeleteReleaseWithIssues
            visible={deleteReleaseVisible}
            versionDelInfo={versionDelInfo}
            onCancel={() => {
              this.setState({
                versionDelInfo: {},
              });
              ReleaseStore.setDeleteReleaseVisible(false);
            }}
            refresh={this.refresh.bind(this, pagination)}
            changeState={(k, v) => {
              this.setState({
                [k]: v,
              });
            }}
          />
          {editRelease ? (
            <EditRelease
              visible={editRelease}
              onCancel={() => {
                this.setState({
                  editRelease: false,
                  selectItem: {},
                });
              }}
              refresh={this.refresh.bind(this, pagination)}
              data={selectItem}
            />
          ) : ''}
          {publicVersion ? (
            <PublicRelease
              visible={publicVersion}
              release={release}
              onCancel={() => {
                this.setState({
                  publicVersion: false,
                });
              }}
              refresh={this.refresh.bind(this, pagination)}
            />
          ) : null}
        </Content>
      </Page>
    );
  }
}

export default withRouter(ReleaseHome);
