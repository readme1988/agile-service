package io.choerodon.agile.infra.mapper;

import java.util.List;
import io.choerodon.mybatis.common.Mapper;
import io.choerodon.agile.infra.dto.*;


/**
 * Created by HuangFuqiang@choerodon.io on 2018/5/16.
 * Email: fuqianghuang01@gmail.com
 */
public interface IssueAttachmentMapper extends Mapper<IssueAttachmentDTO> {

    List<TestCaseAttachmentDTO> listAttachmentDTO();
}