package io.choerodon.agile.api.controller.v1;

import io.choerodon.agile.api.vo.*;
import io.choerodon.agile.app.service.*;
import io.choerodon.agile.infra.dto.MessageDetailDTO;
import io.choerodon.agile.infra.dto.TestCaseAttachmentDTO;
import io.choerodon.agile.infra.dto.TestCaseDTO;
import io.choerodon.agile.infra.feign.NotifyFeignClient;
import io.choerodon.core.annotation.Permission;
import io.choerodon.core.enums.ResourceType;
import io.choerodon.core.iam.InitRoleCode;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * Created by HuangFuqiang@choerodon.io on 2018/11/13.
 * Email: fuqianghuang01@gmail.com
 */
@RestController
@RequestMapping(value = "/v1/fix_data")
public class FixDataController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FixDataController.class);

    @Autowired
    private FixDataService fixDataService;

    @Autowired
    private IssueService issueService;

    @Autowired
    private IssueAttachmentService issueAttachmentService;
    @Autowired
    private IssueLinkService issueLinkService;
    @Autowired
    private ProjectInfoService projectInfoService;
    @Autowired
    private DataLogService dataLogService;
    @Autowired
    private ProductVersionService productVersionService;
    @Autowired
    private NoticeService noticeService;
    @Autowired
    private NotifyFeignClient notifyFeignClient;

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("修复0.19创建项目产生的脏数据【全部】")
    @GetMapping(value = "/fix_create_project_0.19")
    public ResponseEntity fixCreateProject() {
        fixDataService.fixCreateProject();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("修复0.19创建项目产生的脏数据【单个】")
    @GetMapping(value = "/fix_create_project_0.19_single")
    public ResponseEntity fixCreateProjectSingle(@RequestParam("projectId") Long projectId) {
        fixDataService.fixCreateProjectSingle(projectId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】【迁移数据专用】查询测试用例的projectId")
    @GetMapping(value = "/project_ids")
    public ResponseEntity<List<Long>> queryProjectId(){
        return new ResponseEntity<>(issueService.queryProjectIds(), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】【迁移数据专用】根据projectId分批次将测试用例数据传递给test_manager")
    @GetMapping(value = "/migrate_issue/{project_id}")
    public ResponseEntity<List<TestCaseDTO>> migrateIssue(@PathVariable("project_id")Long projectId){
        return new ResponseEntity<>(issueService.migrateTestCaseByProjectId(projectId), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】【迁移数据专用，迁移测试用例的附件信息】")
    @GetMapping(value = "/migrate_attachment")
    public ResponseEntity<List<TestCaseAttachmentDTO>> migrateIssueAttachment(){
        return new ResponseEntity<>(issueAttachmentService.migrateIssueAttachment(), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】迁移项目下link")
    @GetMapping(value = "/migrate_issueLink/{project_id}")
    public ResponseEntity<List<IssueLinkFixVO>> listIssueLinkByIssueIds(@ApiParam(value = "项目id", required = true)
                                                                        @PathVariable(name = "project_id") Long projectId) {
        return new ResponseEntity<>(issueLinkService.listIssueLinkByIssuedIds(projectId), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】迁移projectInfo")
    @GetMapping("/migrate_project_info")
    public ResponseEntity<List<ProjectInfoFixVO>> queryAllProjectInfo() {
        return new ResponseEntity<>(projectInfoService.queryAllProjectInfo(), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】迁移日志")
    @GetMapping("/migrate_data_log/{project_id}")
    public ResponseEntity<List<DataLogFixVO>> migrateDataLog(@ApiParam(value = "项目id", required = true)
                                                             @PathVariable(name = "project_id") Long projectId) {
        return new ResponseEntity<>(dataLogService.queryListByProjectId(projectId), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20】迁移版本")
    @GetMapping("/migrate_version")
    public ResponseEntity<List<TestVersionFixVO>> migrateVersion() {
        return new ResponseEntity<>(productVersionService.queryByVersionId(), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20 BASE】迁移agile_message_detail到框架")
    @GetMapping("/migrate_message")
    public ResponseEntity<List<MessageDetailDTO>> migrateMessageDetail() {
        return new ResponseEntity<>(noticeService.migrateMessageDetail(),HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE, roles = {InitRoleCode.SITE_ADMINISTRATOR, InitRoleCode.SITE_DEVELOPER})
    @ApiOperation("【0.20 BASE】启动敏捷迁移到Base的task")
    @GetMapping("/migration_to_base")
    public ResponseEntity migrateToBase() {
        LOGGER.info("==============================>>>>>>>> AGILE Data Migrate Start In Controller <<<<<<<<=================================");
        notifyFeignClient.checkLog("0.20.0", "agile");
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
