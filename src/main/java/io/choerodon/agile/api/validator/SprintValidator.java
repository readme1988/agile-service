package io.choerodon.agile.api.validator;

import io.choerodon.agile.api.vo.SprintUpdateVO;
import io.choerodon.agile.infra.dto.SprintDTO;
import io.choerodon.agile.infra.mapper.SprintMapper;
import io.choerodon.core.exception.CommonException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Created by HuangFuqiang@choerodon.io on 2019/7/5.
 * Email: fuqianghuang01@gmail.com
 */
@Component
public class SprintValidator {

    private static final String SPRINT_NOT_FOUND = "error.sprint.notFound";
    private static final String SPRINT_ERROR = "error.sprint.notFoundOrIsClosed";
    private static final String SPRINT_START_CODE = "started";
    private static final String SPRINT_PLANNING_CODE = "sprint_planning";
    private static final String SPRINT_CLOSED_CODE = "closed";
    private static final String SPRINT_DATE_ERROR = "error.sprintDate.nullOrStartAfterEndDate";

    @Autowired
    private SprintMapper sprintMapper;

    public void judgeExist(Long projectId, Long sprintId) {
        if (sprintId != null && !Objects.equals(sprintId, 0L)) {
            SprintDTO sprintDTO = new SprintDTO();
            sprintDTO.setProjectId(projectId);
            sprintDTO.setSprintId(sprintId);
            sprintDTO = sprintMapper.selectOne(sprintDTO);
            if (sprintDTO == null || Objects.equals(sprintDTO.getStatusCode(), SPRINT_CLOSED_CODE)) {
                throw new CommonException(SPRINT_ERROR);
            }
        }
    }

    public Boolean hasIssue(Long projectId, Long sprintId) {
        return sprintMapper.hasIssue(projectId, sprintId);
    }

    public void judgeCompleteSprint(Long projectId, Long targetSprintId) {
        judgePlanningExist(projectId, targetSprintId);
    }

    private void judgePlanningExist(Long projectId, Long sprintId) {
        if (sprintId != null && !Objects.equals(sprintId, 0L)) {
            SprintDTO sprintDTO = new SprintDTO();
            sprintDTO.setProjectId(projectId);
            sprintDTO.setStatusCode(SPRINT_PLANNING_CODE);
            sprintDTO.setSprintId(sprintId);
            if (sprintMapper.selectOne(sprintDTO) == null) {
                throw new CommonException(SPRINT_NOT_FOUND);
            }
        }
    }

    public void checkDate(SprintUpdateVO sprintUpdateVO) {
        SprintDTO sprintDTO = new SprintDTO();
        sprintDTO.setProjectId(sprintUpdateVO.getProjectId());
        sprintDTO.setSprintId(sprintUpdateVO.getSprintId());
        sprintDTO = sprintMapper.selectOne(sprintDTO);
        if (sprintDTO == null || (Objects.equals(sprintDTO.getStatusCode(), SPRINT_START_CODE)
                && (sprintDTO.getStartDate() == null || sprintDTO.getEndDate() == null || sprintDTO.getStartDate().after(sprintDTO.getEndDate())))) {
            throw new CommonException(SPRINT_DATE_ERROR);
        }
    }

}
