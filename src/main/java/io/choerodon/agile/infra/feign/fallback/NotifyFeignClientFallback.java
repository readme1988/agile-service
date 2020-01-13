package io.choerodon.agile.infra.feign.fallback;

import io.choerodon.agile.infra.feign.NotifyFeignClient;
import io.choerodon.agile.infra.feign.vo.MessageSettingVO;
import io.choerodon.core.exception.CommonException;
import io.choerodon.core.notify.NoticeSendDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;


@Component
public class NotifyFeignClientFallback implements NotifyFeignClient {

    private static final String FEIGN_ERROR = "notify.error";
    private static final String FEIGN_WS_ERROR = "notify.ws.error";
    private static final String GET_MESSAGE = "notify.get.message.setting.error";

    @Override
    public void postNotice(NoticeSendDTO dto) {
        throw new CommonException(FEIGN_ERROR);
    }

    @Override
    public void postWebSocket(String code, String id, String message) {
        throw new CommonException(FEIGN_WS_ERROR);
    }

    @Override
    public ResponseEntity<MessageSettingVO> getMessageSetting(Long projectId, String notifyType, String code, Long envId, String eventName) {
        throw new CommonException(GET_MESSAGE);
    }

    @Override
    public ResponseEntity<String> checkLog(String version, String type) {
        throw new CommonException("error.data.Miration");
    }
}
