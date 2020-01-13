package io.choerodon.agile.infra.feign;

import io.choerodon.agile.infra.feign.fallback.NotifyFeignClientFallback;
import io.choerodon.agile.infra.feign.vo.MessageSettingVO;
import io.choerodon.core.exception.CommonException;
import io.choerodon.core.notify.NoticeSendDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(value = "notify-service", fallback = NotifyFeignClientFallback.class)
public interface NotifyFeignClient {

    @PostMapping("/v1/notices")
    void postNotice(@RequestBody NoticeSendDTO dto);

    @PostMapping("/v1/notices/ws/{code}/{id}")
    void postWebSocket(@PathVariable("code") String code,
                       @PathVariable("id") String id,
                       @RequestBody String message);

    @GetMapping("/v1/projects/{project_id}/message_settings/type/{notify_type}/code/{code}")
    ResponseEntity<MessageSettingVO> getMessageSetting(@PathVariable(value = "project_id") Long projectId,
                                                       @PathVariable(value = "notify_type") String notifyType,
                                                       @PathVariable(value = "code") String code,
                                                       @RequestParam(value = "env_id", required = false) Long envId,
                                                       @RequestParam(value = "event_name", required = false) String eventName);

    @GetMapping("/v1/upgrade")
    ResponseEntity<String> checkLog(@RequestParam(value = "version") String version,
                                    @RequestParam(value = "type") String type);
}