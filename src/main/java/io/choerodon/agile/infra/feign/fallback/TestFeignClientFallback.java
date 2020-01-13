package io.choerodon.agile.infra.feign.fallback;

import io.choerodon.agile.infra.feign.TestFeignClient;
import io.choerodon.core.exception.CommonException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * @author: 25499
 * @date: 2019/12/13 11:45
 * @description:
 */
@Component
public class TestFeignClientFallback implements TestFeignClient {
    @Override
    public ResponseEntity deleteTestRel(Long projectId, Long defectId) {
        throw new CommonException("error.delete.test.defect.rel");
    }
}
