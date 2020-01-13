import React, { useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button, Tooltip, Icon } from 'choerodon-ui';
import { Modal, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import {
  TabPage as Page, Header, Content, stores, Permission, Breadcrumb,
} from '@choerodon/boot';
import './ComponentHome.less';
import CreateComponent from '../ComponentComponent/AddComponent';
import EditComponent from '../ComponentComponent/EditComponent';
import DeleteComponent from '../ComponentComponent/DeleteComponent';
import TableAction from '@/components/TableAction';
import UserHead from '../../../../components/UserHead';
import Store from './stores';

const { AppState } = stores;
const createKey = Modal.key();
const editKey = Modal.key();
const deleteKey = Modal.key();
const { Column } = Table;


function ComponentHome() {
  const { dataSet, history } = useContext(Store);
  
  const menu = AppState.currentMenuType;
  const urlParams = AppState.currentMenuType;
  const {
    type, id, organizationId: orgId,
  } = menu;
  const handleOk = () => {
    dataSet.query();
  };
  const openCreateModal = () => {
    Modal.open({
      key: createKey,
      title: '创建模块',
      style: {
        width: 380,
      },
      drawer: true,
      children: (
        <CreateComponent          
          onOk={handleOk}
        />
      ),     
    });
  };


  const openEditModal = (record) => {
    const currentComponentId = record.get('componentId');
    Modal.open({
      key: editKey,
      title: '修改模块',
      style: {
        width: 380,
      },
      drawer: true,
      children: (
        <EditComponent 
          componentId={currentComponentId}
          onOk={handleOk}
        />
      ),     
    });
  };
  const openDeleteModal = (component) => {
    Modal.open({
      key: deleteKey,
      title: '删除模块',
      style: {
        width: 520,
      },
      children: (
        <DeleteComponent
          component={component}
          onOk={handleOk}
          history={history}
        />
      ),
    });
  };


  const renderMenu = (text, record) => (
    <TableAction
      menus={[{
        key: 'delete',
        text: '删除',
      }]}
      onEditClick={() => openEditModal(record)}
      onMenuClick={openDeleteModal.bind(this, record)}
      text={(
        <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={text}>
          <p
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: 0,
              lineHeight: '32px',
            }}
          >
            {text}
          </p>
        </Tooltip>
        )}
      type={type}
      projectId={id}
      organizationId={orgId}
      service={['agile-service.issue-component.updateComponent']}
    />
  );

  const renderTable = () => (
    <Table
      dataSet={dataSet}
    >
      <Column
        name="name"
        width={250}
        renderer={({ text, record }) => renderMenu(text, record)}
      />
      <Column
        name="issueCount"
        renderer={({ text: issueCount, record }) => (
          issueCount ? (
            <Link
              to={`/agile/work-list/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&orgId=${urlParams.organizationId}&paramType=component&paramId=${record.get('componentId')}&paramName=${encodeURIComponent(`模块"${record.get('name')}"下的问题`)}`}
            >
              {issueCount}
              {'issues'}              
            </Link>
          ) : null
        )}
      />
      <Column
        name="manager"
        className="c7n-agile-table-cell"
        renderer={({ record }) => (
          record.get('managerId') ? (
            <UserHead
              style={{ display: 'inline-flex' }}
              user={{
                id: record.get('managerId'),
                loginName: record.get('managerLoginName'),
                realName: record.get('managerRealName'),
                name: record.get('managerName'),
                avatar: record.get('imageUrl'),
              }}
            />
          ) : null
        )}
      />
      <Column name="description" className="c7n-agile-table-cell" />
      <Column name="defaultAssigneeRole" className="c7n-agile-table-cell" />
    </Table>
  );
  return (
    <Page
      className="c7n-component"
      service={[
        'agile-service.issue-component.updateComponent',
        'agile-service.issue-component.deleteComponent',
        'agile-service.issue-component.createComponent',
        'agile-service.issue-component.listByProjectId',
      ]}
    >
      <Header title="模块管理">
        <Permission
          type={type}
          projectId={id}
          organizationId={orgId}
          service={['agile-service.issue-component.createComponent']}
        >
          <Button funcType="flat" onClick={openCreateModal}>
            <Icon type="playlist_add icon" />
            <span>创建模块</span>
          </Button>
        </Permission>
      </Header>
      <Breadcrumb />
      <Content>
        {renderTable()}
      </Content>
    </Page>
  );
}

export default withRouter(observer(ComponentHome));
