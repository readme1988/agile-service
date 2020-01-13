import React from 'react';
import { Dropdown, Menu, Button } from 'choerodon-ui';
import './index.less';

const prefix = 'c7n-table-action';
const TableAction = (props) => {
  const {
    menus, text, onMenuClick, onEditClick,
  } = props;
  const renderMenu = () => (
    <Menu onClick={onMenuClick}>
      {menus.map(menu => (
        <Menu.Item key={menu.key}>
          {menu.text}
        </Menu.Item>
      ))}      
    </Menu>
  );
  return (
    <div className={prefix}>
      <span style={{ display: 'flex', overflow: 'hidden' }}>
        <a style={{ overflow: 'hidden' }} role="button" onClick={onEditClick} onKeyDown={null}>
          {text}
        </a>
      </span>
      {
        menus.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dropdown overlay={renderMenu()} trigger="click">
              <Button shape="circle" icon="more_vert" />
            </Dropdown>
          </div>
        ) : null
      }
    </div>
  );
};

export default TableAction;
