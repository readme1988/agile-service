import React, {
  useContext, useRef, useEffect, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import {
  Header, Content, Page, Breadcrumb, axios,
} from '@choerodon/boot';
import {
  Button, Tooltip, Tag,
} from 'choerodon-ui';
import queryString from 'querystring';
import { Table } from 'choerodon-ui/pro';
import { map } from 'lodash';
import TypeTag from '@/components/TypeTag';
import StatusTag from '@/components/StatusTag';
import UserHead from '@/components/UserHead';
import CreateIssue from '@/components/CreateIssue';
import QuickCreateIssue from '@/components/QuickCreateIssue';
import PriorityTag from '@/components/PriorityTag';
import IssueStore from '../../stores/project/sprint/IssueStore/IssueStore';
import Store, { StoreProvider } from './stores';
import Search from './components/search';
import FilterManage from './components/FilterManage';
import SaveFilterModal from './components/SaveFilterModal';
import ExportIssue from './components/ExportIssue';
import ExpandWideCard from './components/ExpandWideCard';
import ImportIssue from './components/ImportIssue';
import './index.less';

const { Column } = Table;
const Issue = withRouter(observer(() => {
  const { dataSet, projectId, fields } = useContext(Store);
  const [urlFilter, setUrlFilter] = useState(null);
  const importRef = useRef();
  const tableRef = useRef();

  /**
   * 默认此次操作不是删除操作
   * 防止删除此页一条数据时页时停留当前页时出现无数据清空
   * @param {Boolean} isDelete  用于标记是否为删除操作
   */
  const refresh = (isDelete = false) => {
    dataSet.query(isDelete && dataSet.length === 1 && dataSet.totalCount > 1 ? dataSet.currentPage - 1 : dataSet.currentPage);
  };

  const initFilter = async () => {
    const {
      paramChoose, paramCurrentVersion, paramCurrentSprint, paramId,
      paramType, paramIssueId, paramName, paramOpenIssueId,
      // eslint-disable-next-line no-restricted-globals
    } = queryString.parse(location.href);
    let prefix = '';
    if (paramChoose) {
      if (paramChoose === 'version' && paramCurrentVersion) {
        dataSet.queryDataSet.current.set(paramChoose, [paramCurrentVersion]);
        prefix = '版本';
      }
      if (paramChoose === 'sprint' && paramCurrentSprint) {
        dataSet.queryDataSet.current.set(paramChoose, [paramCurrentSprint]);
        prefix = '冲刺';
      }
    }
    const prefixs = {
      assigneeId: '经办人',
      typeCode: '类型',
      priority: '优先级',
      statusId: '状态',
      fixVersion: '版本',
      version: '版本',
      component: '模块',
      sprint: '冲刺',
      epic: '史诗',
      label: '标签',
    };
    if (paramType) {
      prefix = prefixs[paramType];
      dataSet.queryDataSet.current.set(paramType, [paramId]);
    }
    setUrlFilter(`${prefix ? `${prefix}:` : ''}${paramName || ''}`);
    // this.paramName = decodeURI(paramName);
    // 单个任务跳转 => otherArgs 设置 issueId，将任务设定为展开模式
    if (paramIssueId) {
      dataSet.queryDataSet.current.set('issueIds', [paramOpenIssueId || paramIssueId]);
      dataSet.queryDataSet.current.set('contents', [`${IssueStore.getProjectInfo.projectCode}-${paramName.split('-')[paramName.split('-').length - 1]}`]);
      IssueStore.setClickedRow({
        selectedIssue: {
          issueId: paramOpenIssueId || paramIssueId,
        },
        expand: true,
      });
    } else {
      await dataSet.query();
    }
  };
  const handleClear = () => {
    setUrlFilter(null);
  };
  const getProjectInfo = () => {
    axios.get(`/agile/v1/projects/${projectId}/project_info`).then((res) => {
      IssueStore.setProjectInfo(res);
      initFilter();
    });
  };
  useEffect(() => {
    getProjectInfo();
    return () => {
      IssueStore.setClickedRow({ selectedIssue: {}, expand: false });
      IssueStore.setFilterListVisible(false);
    };
  }, []);
  const handleRowClick = (record) => {
    dataSet.select(record);
    const editFilterInfo = IssueStore.getEditFilterInfo;
    IssueStore.setClickedRow({
      selectedIssue: {
        issueId: record.get('issueId'),
      },
      expand: true,
    });
    IssueStore.setFilterListVisible(false);
    IssueStore.setEditFilterInfo(map(editFilterInfo, item => Object.assign(item, { isEditing: false })));
  };
  const renderTag = (listField, nameField) => ({ record }) => {
    const list = record.get(listField);
    if (list) {
      if (list.length > 0) {
        return (
          <div style={{ display: 'inline-flex', maxWidth: '100%' }}>
            <Tag
              color="blue"
              style={{
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'auto',
              }}
            >
              {list[0][nameField]}
            </Tag>
            {list.length > 1 ? <Tag color="blue">...</Tag> : null}
          </div>
        );
      }
    }
    return null;
  };
  function renderEpic({ record }) {
    const color = record.get('epicColor');
    const name = record.get('epicName');
    const style = {
      color,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: color,
      borderRadius: '2px',
      fontSize: '13px',
      lineHeight: '20px',
      padding: '0 8px',
      display: 'inline-block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    return name ? <span style={style}>{name}</span> : null;
  }
  const handleCreateIssue = (issue) => {
    IssueStore.createQuestion(false);
    // dataSet.queryDataSet.current.clear();
    dataSet.query();
    // handleClear();
    // if (issue) {
    //   IssueStore.setClickedRow({
    //     selectedIssue: issue,
    //     expand: true,
    //   });
    // }
  };

  const renderTable = () => (
    <Table
      ref={tableRef}
      dataSet={dataSet}
      // queryBar="none"
      footer={<div style={{ paddingTop: 5 }}><QuickCreateIssue onCreate={handleCreateIssue} /></div>}
      onRow={({ record }) => ({
        className: IssueStore.selectedIssue.issueId && record.get('issueId') === IssueStore.selectedIssue.issueId ? 'c7nagile-row-selected' : null,
      })}
    >
      <Column
        sortable
        name="issueId"
        width={240}
        onCell={({ record }) => ({
          onClick: () => {
            handleRowClick(record);
          },
        })}
        renderer={({ record }) => (
          <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`问题概要： ${record.get('summary')}`}>
            <span className="c7n-agile-table-cell-click">
              {record.get('summary')}
            </span>
          </Tooltip>
        )}
      />
      <Column
        sortable
        name="issueTypeId"
        className="c7n-agile-table-cell"
        renderer={({ record }) => (<TypeTag data={record.get('issueTypeVO')} showName />)}
      />
      <Column sortable name="issueNum" className="c7n-agile-table-cell" />
      <Column
        sortable
        name="priorityId"
        className="c7n-agile-table-cell"
        renderer={({ record }) => (
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.get('priorityDTO') ? record.get('priorityDTO').name : ''}`}>
            <PriorityTag
              priority={record.get('priorityVO')}
              style={{ display: 'inline-block' }}
            />
          </Tooltip>
        )}
      />
      <Column
        sortable
        name="reporterId"
        className="c7n-agile-table-cell"
        renderer={({ record }) => (
          <div style={{ display: 'inline-flex' }}>
            <UserHead
              user={{
                id: record.get('reporterId'),
                name: record.get('reporterName'),
                loginName: record.get('reporterLoginName'),
                realName: record.get('reporterRealName'),
                avatar: record.get('reporterImageUrl'),
              }}
            />
          </div>
        )}
      />

      <Column
        sortable
        name="statusId"
        renderer={({ record }) => (
          <StatusTag
            inTable
            data={record.get('statusVO')}
            style={{ display: 'inline-block' }}
          />
        )}
      />
      <Column
        sortable
        name="assigneeId"
        renderer={({ record }) => (
          <div style={{ display: 'inline-flex' }}>
            <UserHead
              user={{
                id: record.get('assigneeId'),
                name: record.get('assigneeName'),
                loginName: record.get('assigneeLoginName'),
                realName: record.get('assigneeRealName'),
                avatar: record.get('assigneeImageUrl'),
              }}
            />
          </div>
        )}
      />
      <Column sortable name="lastUpdateDate" className="c7n-agile-table-cell" />
      <Column hidden name="label" className="c7n-agile-table-cell" renderer={renderTag('labelIssueRelVOS', 'labelName')} />
      <Column hidden name="component" className="c7n-agile-table-cell" renderer={renderTag('issueComponentBriefVOS', 'name')} />
      <Column hidden name="storyPoints" className="c7n-agile-table-cell" renderer={({ text }) => text || '-'} />
      <Column hidden name="version" className="c7n-agile-table-cell" renderer={renderTag('versionIssueRelVOS', 'name')} />
      <Column hidden name="epic" className="c7n-agile-table-cell" renderer={renderEpic} />
      <Column name="issueSprintVOS" renderer={renderTag('issueSprintVOS', 'sprintName')} />
      {fields.map(field => (
        <Column
          hidden
          name={field.code}
          header={field.title}
          className="c7n-agile-table-cell"
          renderer={({ record }) => {
            const { fieldType, code } = field;
            const value = record.get('foundationFieldValue')[code];
            if (fieldType === 'member') {
              return value && (
                <div style={{ display: 'inline-flex' }}>
                  <UserHead
                    user={value}
                  />
                </div>
              );
            }
            return <span>{value || ''}</span>;
          }}
        />
      ))}
    </Table>
  );
  const onHideIssue = () => {
    dataSet.unSelectAll();
  };
  const handleClickFilterManage = () => {
    const editFilterInfo = IssueStore.getEditFilterInfo;
    const filterListVisible = IssueStore.getFilterListVisible;
    IssueStore.setSaveFilterVisible(false);
    IssueStore.setFilterListVisible(!filterListVisible);
    IssueStore.setEditFilterInfo(map(editFilterInfo, item => Object.assign(item, { isEditing: false })));
  };
  return (
    <Page 
      className="c7nagile-issue"
      service={[
        'agile-service.personal-filter.listByProjectId',
        'agile-service.scheme.queryDefaultByOrganizationId',
        'agile-service.issue.listFeature',
        'agile-service.field-value.getIssueHeadForAgile',
        'agile-service.issue.listIssueWithSub',
        'agile-service.sprint.queryByProjectId',
        'agile-service.sprint.queryNameByOptions',
        'agile-service.product-version.queryNameByOptions',
        'agile-service.product-version.queryVersionByProjectId',
        'base-service.organization-project.getGroupInfoByEnableProject',
        'agile-service.project-info.queryProjectInfoByProjectId',
        'agile-service.quick-filter.listByProjectId',
        'agile-service.issue-component.queryComponentById',
        'agile-service.scheme.queryIssueTypesWithStateMachineIdByProjectId',
        'agile-service.scheme.queryStatusByProjectId',
        'base-service.project.list',
        'agile-service.excel.download',
        'agile-service.excel.queryLatestRecode',
        'agile-service.excel.batchImport',
        'agile-service.issue.exportIssues',
        'agile-service.personal-filter.checkName',
        'agile-service.personal-filter.create',
        'agile-service.personal-filter.update',
        'agile-service.personal-filter.deleteById',
      ]}
    >
      <Header
        title="问题管理"
        backPath={IssueStore.getBackUrl}
      >
        {/* <BackButton /> */}
        <Button
          className="leftBtn"
          funcType="flat"
          icon="playlist_add"
          onClick={() => {
            IssueStore.createQuestion(true);
          }}
        >
          创建问题
        </Button>
        <Button icon="archive" funcType="flat" onClick={() => importRef.current.open()}>
          导入问题
        </Button>
        <Button
          className="leftBtn"
          icon="get_app"
          funcType="flat"
          onClick={() => {
            IssueStore.setExportModalVisible(true);
          }}
        >
          导出问题
        </Button>
        <Button onClick={handleClickFilterManage} icon="settings">筛选管理</Button>
      </Header>
      <Breadcrumb />
      <Content style={{ paddingTop: 0 }}>
        <Search urlFilter={urlFilter} onClear={handleClear} />
        {renderTable()}
        <SaveFilterModal dataSet={dataSet} />
        <FilterManage />
        <ExportIssue dataSet={dataSet} tableRef={tableRef} />
        {IssueStore.getCreateQuestion && (
          <CreateIssue
            visible={IssueStore.getCreateQuestion}
            onCancel={() => { IssueStore.createQuestion(false); }}
            onOk={handleCreateIssue}
          />
        )}
        <ExpandWideCard
          onHideIssue={onHideIssue}
          issueRefresh={refresh}
          dataSet={dataSet}
        />
        <ImportIssue ref={importRef} onFinish={refresh} />
      </Content>
    </Page>
  );
}));

export default props => (
  <StoreProvider {...props}>
    <Issue />
  </StoreProvider>
);
