package io.choerodon.agile.app.service;

import io.choerodon.agile.api.vo.LookupTypeWithValuesVO;

import java.util.Map;

/**
 * 敏捷开发code键值
 *
 * @author dinghuang123@gmail.com
 * @since 2018-05-15 09:40:27
 */
public interface LookupValueService {

    LookupTypeWithValuesVO queryLookupValueByCode(String typeCode);

    LookupTypeWithValuesVO queryConstraintLookupValue();

    Map<String, String> queryMapByTypeCode(String typeCode);

}