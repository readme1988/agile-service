package io.choerodon.agile.infra.template;

import io.choerodon.core.notify.*;
import org.springframework.stereotype.Component;
/**
 * Created by HuangFuqiang@choerodon.io on 2018/10/8.
 * Email: fuqianghuang01@gmail.com
 */
@Component
@NotifyBusinessType(code = "issueAssignee",
        name = "问题分配",
        description = "问题分配，给相关用户发送通知",
        level = Level.PROJECT,
        categoryCode = "issue-status-change-notice",
        pmEnabledFlag = true,
        proPmEnabledFlag = true,
        notifyType = ServiceNotifyType.AGILE_NOTIFY,
        targetUserType = {TargetUserType.TARGET_USER_ASSIGNEE, TargetUserType.TARGET_USER_REPORTER})
public class IssueAssigneePmTemplate implements PmTemplate {

    @Override
    public String businessTypeCode() {
        return "issueAssignee";
    }

    @Override
    public String code() {
        return "issueAssignee-preset";
    }

    @Override
    public String name() {
        return "问题分配";
    }

    @Override
    public String title() {
        return "问题分配";
    }

    @Override
    public String content() {
        return "<p><a href=${url} target=_blank>${summary}</a > 分配给 ${assigneeName}</p>";
    }
}
