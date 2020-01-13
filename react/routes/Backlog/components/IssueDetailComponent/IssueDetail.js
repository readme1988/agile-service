import React, { Component } from 'react';
import { observer } from 'mobx-react';
import EditIssue from '../../../../components/EditIssue';
import BacklogStore from '../../../../stores/project/backlog/BacklogStore';

@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);

    this.EditIssue = React.createRef();
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  /**
   *detail有更新回调待办事项更新
   *
   * @memberof IssueDetail
   */
  handleIssueUpdate() {
    const chosenEpic = BacklogStore.getChosenEpic;
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }
  
  /**
   * 重置点击
   * @param {*} current 
   */
  handleResetClicked(current) {
    // BacklogStore.clickedOnce(sprintId, current);
    BacklogStore.setClickIssueDetail(current);
  }

  /**
   * 刷新issue详情的数据
   */
  refreshIssueDetail() {
    if (this.EditIssue.current) {
      this.EditIssue.current.loadIssueDetail();
    }
  }

  render() {
    // const { paramOpenIssueId } = this.state;
    const { refresh } = this.props;
    const visible = Object.keys(BacklogStore.getClickIssueDetail).length > 0;
    const { programId, issueId } = BacklogStore.getClickIssueDetail || {};
    return (
      <EditIssue
        visible={visible}
        forwardedRef={this.EditIssue}
        issueId={BacklogStore.getClickIssueId}
        programId={programId}
        disabled={programId}
        applyType={programId ? 'program' : 'agile'}
        onCurrentClicked={this.handleResetClicked}
        onCancel={() => {
          BacklogStore.setClickIssueDetail({});
          BacklogStore.setIsLeaveSprint(false);
          BacklogStore.clearMultiSelected();
        }}
        onDeleteIssue={() => {
          BacklogStore.setClickIssueDetail({});
          BacklogStore.setIsLeaveSprint(false);
          refresh();
        }}
        onCreateVersion={() => {
          BacklogStore.axiosGetVersion().then((data2) => {
            const newVersion = [...data2];
            for (let index = 0, len = newVersion.length; index < len; index += 1) {
              newVersion[index].expand = false;
            }
            BacklogStore.setVersionData(newVersion);
          }).catch((error) => {
          });
        }}
        onUpdate={refresh}
      />
    );
  }
}

export default IssueDetail;
