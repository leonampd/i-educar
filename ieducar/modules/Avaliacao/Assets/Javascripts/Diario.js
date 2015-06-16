//$j('#form_resultado').submit(function(event) {event.preventDefault()});

// variaveis usadas pelo modulo Frontend/Process.js
var PAGE_URL_BASE = 'diario';
var API_URL_BASE  = 'diarioApi';

var RESOURCE_NAME  = 'matricula';
var RESOURCES_NAME = 'matriculas';

var POST_LABEL   = '';
var DELETE_LABEL = '';

var SEARCH_ORIENTATION = '';

var nomenclatura_exame = '';

// funcoes usados pelo modulo Frontend/Process.js
var onClickSelectAllEvent = false;
var onClickActionEvent    = false;
var onClickDeleteEvent    = false;

var usaRecuperacaoParalelaPorEtapa;
var mediaRecuperacaoParalela;
var sentidoTab;

$(function() {
    navegacaoTab(dataResponse.navegacao_tab);
});

//url builders
var deleteResourceUrlBuilder = {
  buildUrl : function(urlBase, resourceName, additionalVars) {

    var vars = {
      resource : resourceName,
      oper : 'delete',
      instituicao_id : $j('#ref_cod_instituicao').val(),
      escola_id : $j('#ref_cod_escola').val(),
      curso_id : $j('#ref_cod_curso').val(),
      serie_id : $j('#ref_ref_cod_serie').val(),
      turma_id : $j('#ref_cod_turma').val(),
      ano_escolar : $j('#ano').val(),
      etapa : $j('#etapa').val()
    };

    return resourceUrlBuilder.buildUrl(urlBase, $j.extend(vars, additionalVars));
  }
};


var postResourceUrlBuilder = {
  buildUrl : function(urlBase, resourceName, additionalVars) {

    var vars = {
      resource : resourceName,
      oper : 'post',
      instituicao_id : $j('#ref_cod_instituicao').val(),
      escola_id : $j('#ref_cod_escola').val(),
      curso_id : $j('#ref_cod_curso').val(),
      serie_id : $j('#ref_ref_cod_serie').val(),
      turma_id : $j('#ref_cod_turma').val(),
      ano_escolar : $j('#ano').val(),
      componente_curricular_id : $j('#ref_cod_componente_curricular').val(),
      etapa : $j('#etapa').val(),
      matricula_id : $j('#etapa').val()
    };

    return resourceUrlBuilder.buildUrl(urlBase, $j.extend(vars, additionalVars));

  }
};


var getResourceUrlBuilder = {
  buildUrl : function(urlBase, resourceName, additionalVars) {

    var vars = {
      resource : resourceName,
      oper : 'get',
      instituicao_id : $j('#ref_cod_instituicao').val(),
      escola_id : $j('#ref_cod_escola').val(),
      curso_id : $j('#ref_cod_curso').val(),
      serie_id : $j('#ref_ref_cod_serie').val(),
      turma_id : $j('#ref_cod_turma').val(),
      ano_escolar : $j('#ano').val(),
      componente_curricular_id : $j('#ref_cod_componente_curricular').val(),
      etapa : $j('#etapa').val(),
      matricula_id : $j('#ref_cod_matricula').val()
    };

    return resourceUrlBuilder.buildUrl(urlBase, $j.extend(vars, additionalVars));

  }
};


function changeResource($resourceElement, postFunction, deleteFunction) {
  if ($j.trim($resourceElement.val())  == '')
    deleteFunction($resourceElement);
  else
    postFunction($resourceElement);
};


function setDefaultFaltaIfEmpty(matricula_id, componente_curricular_id) {
  var $element = $j('#falta-matricula-' + matricula_id + '-cc-' + componente_curricular_id);
  if ($j.trim($element.val()) == '') {
    $element.val(0);
    $element.change();
  }
}


var changeNota = function(event) {
  var $element = $j(this);
  setDefaultFaltaIfEmpty($element.data('matricula_id'), $element.data('componente_curricular_id'));
  changeResource($element, postNota, deleteNota);
};


var changeNotaExame = function(event) {
  var $element = $j(this);
  setDefaultFaltaIfEmpty($element.data('matricula_id'), $element.data('componente_curricular_id'));
  changeResource($element, postNotaExame, deleteNotaExame);
};

var changeNotaRecuperacaoParalela = function(event){
  var $element = $j(this);
  setDefaultFaltaIfEmpty($element.data('matricula_id'), $element.data('componente_curricular_id'));
  changeResource($element, postNotaRecuperacaoParalela, deleteNotaRecuperacaoParalela);
}

var changeFalta = function(event) {
  $element = $j(this);
  changeResource($element, postFalta, deleteFalta);

  // se presenca geral, muda o valor em todas faltas da mesma matricula
  if ($tableSearchDetails.data('details').tipo_presenca == 'geral') {
    var $fieldsFaltaMatricula = $element.closest('table').find('.falta-matricula-' + $element
                                                               .data('matricula_id') + '-cc')
                                                               .not($element);

    $fieldsFaltaMatricula.val($element.val());
    $fieldsFaltaMatricula.data('old_value', $element.val());
  }
};


var changeParecer = function(event) {
  var $element = $j(this);
  setDefaultFaltaIfEmpty($element.data('matricula_id'), $element.data('componente_curricular_id'));
  changeResource($element, postParecer, deleteParecer);

  // se parecer geral, muda o valor em todos pareceres da mesma matricula
  var parecerGeral = $j.inArray($tableSearchDetails.data('details').tipo_parecer_descritivo,
                                ['etapa_geral', 'anual_geral']) > -1;

  if (parecerGeral) {
    var $fieldsParecerMatricula = $element.closest('table').find('.parecer-matricula-' + $element
                                                                 .data('matricula_id') + '-cc')
                                                                 .not($element);

    $fieldsParecerMatricula.val($element.val());
    $fieldsParecerMatricula.data('old_value', $element.val());
  }
};


function afterChangeResource($resourceElement) {
  $resourceElement.removeAttr('disabled').siblings('img').remove();

  var resourceElementTabIndex = parseInt($resourceElement.attr('tabindex'));
  var focusedElementTabIndex  = parseInt($j('.tabable:focus').first().attr('tabindex'));
  var lastElementTabIndex     = parseInt($resourceElement.closest('form').find('.tabable').last().attr('tabindex'));

  // percorre os proximos elementos enquanto não chegar no ultimo
  for(var nextTabIndex = resourceElementTabIndex + 1; nextTabIndex < lastElementTabIndex + 1; nextTabIndex++) {
    //var $nextElement = $j($resourceElement.closest('form').find('.tabable:[tabindex="'+nextTabIndex+'"]')).first();
    var $nextElement = $j($resourceElement.closest('form').find('.tabable[tabindex="'+nextTabIndex+'"]')).first();
    var $nextNextElement = $j($resourceElement.closest('form').find('.tabable[tabindex="'+(nextTabIndex+1)+'"]')).first();

    // seta foco no proximo elemento, caso este seja visivel e o elemento alterado ainda esteja focado
    if($nextElement.is(':visible')) {
      if(resourceElementTabIndex == focusedElementTabIndex){
        $nextElement.focus();
      }

      break;
    }else{
      $nextNextElement.focus();
    }
  }
}

function postNota($notaFieldElement) {

  $notaFieldElement.val($notaFieldElement.val().replace(',', '.'));

  if (validatesIfValueIsNumeric($notaFieldElement.val(), $notaFieldElement.attr('id')) &&
      validatesIfNumericValueIsInRange($notaFieldElement.val(), $notaFieldElement.attr('id'), 0, window.notaLimits.nota_maxima_geral) &&
      validatesIfDecimalPlacesInRange($notaFieldElement.val(), $notaFieldElement.attr('id'), 0, window.notaLimits.qtd_casas_decimais) /* &&
      validatesIfValueIsInSet($notaFieldElement.val(), $notaFieldElement.attr('id'), $tableSearchDetails.data('details').opcoes_notas)*/) {

    beforeChangeResource($notaFieldElement);

    var additionalVars = {
      matricula_id             : $notaFieldElement.data('matricula_id'),
      componente_curricular_id : $notaFieldElement.data('componente_curricular_id'),
      nota_original            : $notaFieldElement.val()
    };

    var options = {
      url : postResourceUrlBuilder.buildUrl(API_URL_BASE, 'nota', additionalVars),
      dataType : 'json',
      data : {att_value : $notaFieldElement.val()},
      success : function(dataResponse) {
        checkIfShowNotaRecuperacaoParalelaField($notaFieldElement.val(), dataResponse);
        afterChangeResource($notaFieldElement);
        handleChange(dataResponse);
      }
    };

    $notaFieldElement.data('old_value', $notaFieldElement.val());
    postResource(options, handleErrorOnPostResource);
  }
}

function checkIfShowNotaRecuperacaoParalelaField(notaLancada, dataResponse){
  componente_curricular_id = dataResponse.componente_curricular_id
  matricula_id = dataResponse.matricula_id
  $jnotaRecuperacaoParalelaField = $j('#nota-recuperacao-paralela-' + matricula_id + '-cc-' + componente_curricular_id);

  if(usaRecuperacaoParalelaPorEtapa){
    if((notaLancada < mediaRecuperacaoParalela) || (mediaRecuperacaoParalela == null)){
      $jnotaRecuperacaoParalelaField.show();
      // Somente seta o foco do campo quando o tab for horizontal,
      // pois se for vertical não faz sentido e atrapalha a navegação
      if(sentidoTab == "1"){
        $jnotaRecuperacaoParalelaField.focus();
      }
    }else{
      $jnotaRecuperacaoParalelaField.hide();
    }
  }
}


function postNotaExame($notaExameFieldElement) {

  $notaExameFieldElement.val($notaExameFieldElement.val().replace(',', '.'));

  if (validatesIfValueIsNumeric($notaExameFieldElement.val(), $notaExameFieldElement.attr('id')) &&
      validatesIfNumericValueIsInRange($notaExameFieldElement.val(), $notaExameFieldElement.attr('id'), 0, window.notaLimits.nota_maxima_exame_final) &&
      validatesIfDecimalPlacesInRange($notaExameFieldElement.val(), $notaExameFieldElement.attr('id'), 0, window.notaLimits.qtd_casas_decimais)/*&&
      validatesIfValueIsInSet($notaExameFieldElement.val(), $notaExameFieldElement.attr('id'), $tableSearchDetails.data('details').opcoes_notas)*/) {

    beforeChangeResource($notaExameFieldElement);

    var additionalVars = {
      matricula_id             : $notaExameFieldElement.data('matricula_id'),
      componente_curricular_id : $notaExameFieldElement.data('componente_curricular_id'),
      etapa : 'Rc'
    };

    var options = {
      url : postResourceUrlBuilder.buildUrl(API_URL_BASE, 'nota_exame', additionalVars),
      dataType : 'json',
      data : {att_value : $notaExameFieldElement.val()},
      success : function(dataResponse) {
        afterChangeResource($notaExameFieldElement);
        handleChange(dataResponse);
      }
    };

    $notaExameFieldElement.data('old_value', $notaExameFieldElement.val());
    postResource(options, handleErrorOnPostResource);
  }
}


function postNotaRecuperacaoParalela($notaRecuperacaoParalelaElement) {

  $notaRecuperacaoParalelaElement.val($notaRecuperacaoParalelaElement.val().replace(',', '.'));

  if (validatesIfValueIsNumeric($notaRecuperacaoParalelaElement.val(), $notaRecuperacaoParalelaElement.attr('id')) &&
      validatesIfNumericValueIsInRange($notaRecuperacaoParalelaElement.val(), $notaRecuperacaoParalelaElement.attr('id'), 0, window.notaLimits.nota_maxima_geral) &&
      validatesIfDecimalPlacesInRange($notaRecuperacaoParalelaElement.val(), $notaRecuperacaoParalelaElement.attr('id'), 0, window.notaLimits.qtd_casas_decimais)/* &&
      validatesIfValueIsInSet($notaRecuperacaoParalelaElement.val(), $notaRecuperacaoParalelaElement.attr('id'), $tableSearchDetails.data('details').opcoes_notas)*/) {

    beforeChangeResource($notaRecuperacaoParalelaElement);

    var additionalVars = {
      matricula_id             : $notaRecuperacaoParalelaElement.data('matricula_id'),
      componente_curricular_id : $notaRecuperacaoParalelaElement.data('componente_curricular_id')
    };

    var options = {
      url : postResourceUrlBuilder.buildUrl(API_URL_BASE, 'nota_recuperacao_paralela', additionalVars),
      dataType : 'json',
      data : {att_value : $notaRecuperacaoParalelaElement.val()},
      success : function(dataResponse) {
        afterChangeResource($notaRecuperacaoParalelaElement);
        handleChange(dataResponse);
      }
    };

    $notaRecuperacaoParalelaElement.data('old_value', $notaRecuperacaoParalelaElement.val());
    postResource(options, handleErrorOnPostResource);
  }
}

function postFalta($faltaFieldElement) {
  $faltaFieldElement.val($faltaFieldElement.val().replace(',', '.'));

  //falta é persistida como inteiro
  if ($j.isNumeric($faltaFieldElement.val()))
    $faltaFieldElement.val(parseInt($faltaFieldElement.val()).toString());

  if (validatesIfValueIsNumeric($faltaFieldElement.val(), $faltaFieldElement.attr('id')) &&
      validatesIfNumericValueIsInRange($faltaFieldElement.val(), $faltaFieldElement.attr('id'), 0, 100)) {

    beforeChangeResource($faltaFieldElement);

    var additionalVars = {
      matricula_id             : $faltaFieldElement.data('matricula_id'),
      componente_curricular_id : $faltaFieldElement.data('componente_curricular_id')
    };

    var options = {
      url : postResourceUrlBuilder.buildUrl(API_URL_BASE, 'falta', additionalVars),
      dataType : 'json',
      data : {att_value : $faltaFieldElement.val()},
      success : function(dataResponse) {
        afterChangeResource($faltaFieldElement);
        handleChange(dataResponse);
      }
    };

    $faltaFieldElement.data('old_value', $faltaFieldElement.val());
    postResource(options, handleErrorOnPostResource);
  }
}


function getEtapaParecer() {
  if ($tableSearchDetails.data('details').tipo_parecer_descritivo.split('_')[0] == 'anual')
    var etapaParecer = 'An';
  else
    var etapaParecer = $j('#etapa').val();

  return etapaParecer;
}


function postParecer($parecerFieldElement) {
  var additionalVars = {
    matricula_id             : $parecerFieldElement.data('matricula_id'),
    componente_curricular_id : $parecerFieldElement.data('componente_curricular_id'),
    etapa : getEtapaParecer()
  };

  var options = {
    url : postResourceUrlBuilder.buildUrl(API_URL_BASE, 'parecer', additionalVars),
    dataType : 'json',
    data : {att_value : $parecerFieldElement.val()},
    success : function(dataResponse) {
      afterChangeResource($parecerFieldElement);
      handleChange(dataResponse);
    }
  };

  $parecerFieldElement.data('old_value', $parecerFieldElement.val());
  postResource(options, handleErrorOnPostResource);
}


function confirmDelete(resourceName) {
  return confirm(safeUtf8Decode('Confirma exclusão ' + resourceName.replace('_',' ') + '?'));
}


function deleteResource(resourceName, $resourceElement, options, handleErrorOnDeleteResource) {
  if (confirmDelete(resourceName)) {
    beforeChangeResource($resourceElement);
    $resourceElement.data('old_value', '');
    $j.ajax(options).error(handleErrorOnDeleteResource);
  }
  else
  {
    afterChangeResource($resourceElement);
    $resourceElement.val($resourceElement.data('old_value'));
  }
}


function deleteNota($notaFieldElement) {
  var resourceName = 'nota';

  var additionalVars = {
    instituicao_id : $j('#ref_cod_instituicao').val(),
    escola_id : $j('#ref_cod_escola').val(),
    curso_id : $j('#ref_cod_curso').val(),
    serie_id : $j('#ref_ref_cod_serie').val(),
    turma_id : $j('#ref_cod_turma').val(),
    ano_escolar : $j('#ano').val(),
    componente_curricular_id : $notaFieldElement.data('componente_curricular_id'),
    etapa : $j('#etapa').val(),
    matricula_id : $notaFieldElement.data('matricula_id')
   };

  var options = {
    url : deleteResourceUrlBuilder.buildUrl(API_URL_BASE, resourceName, additionalVars),
    dataType : 'json',
    success : function(dataResponse) {
      checkIfShowNotaRecuperacaoParalelaField($notaFieldElement.val(), dataResponse);
      afterChangeResource($notaFieldElement);
      handleChange(dataResponse);
    }
  };

  deleteResource(resourceName, $notaFieldElement, options, handleErrorOnDeleteResource);
};

function deleteNotaRecuperacaoParalela($notaRecuperacaoParalelaElement) {
  var resourceName = 'nota_recuperacao_paralela';

  var additionalVars = {
    componente_curricular_id : $notaRecuperacaoParalelaElement.data('componente_curricular_id'),
    etapa : $j('#etapa').val(),
    matricula_id : $notaRecuperacaoParalelaElement.data('matricula_id')
   };

  var options = {
    url : deleteResourceUrlBuilder.buildUrl(API_URL_BASE, resourceName, additionalVars),
    dataType : 'json',
    success : function(dataResponse) {
      afterChangeResource($notaRecuperacaoParalelaElement);
      handleChange(dataResponse);
    }
  };
  deleteResource(resourceName, $notaRecuperacaoParalelaElement, options, handleErrorOnDeleteResource);
};


function deleteNotaExame($notaExameFieldElement) {
  var resourceName = 'nota_exame';

  var additionalVars = {
    componente_curricular_id : $notaExameFieldElement.data('componente_curricular_id'),
    etapa : 'Rc',
    matricula_id : $notaExameFieldElement.data('matricula_id')
   };

  var options = {
    url : deleteResourceUrlBuilder.buildUrl(API_URL_BASE, resourceName, additionalVars),
    dataType : 'json',
    success : function(dataResponse) {
      afterChangeResource($notaExameFieldElement);
      handleChange(dataResponse);
    }
  };

  deleteResource(resourceName, $notaExameFieldElement, options, handleErrorOnDeleteResource);
};


function deleteFalta($faltaFieldElement) {

  //excluir falta se nota, nota exame e parecer (não existirem ou) estiverem sem valor
  var matriculaId = $faltaFieldElement.data('matricula_id');
  var ccId = $faltaFieldElement.data('componente_curricular_id');

  var $notaField = $j('#nota-matricula-'+ matriculaId + '-cc-' + ccId);
  var $notaExameField = $j('#nota-exame-matricula-'+ matriculaId + '-cc-' + ccId);
  var $parecerField = $j('#parecer-matricula-'+ matriculaId + '-cc-' + ccId);

  if(($notaField.length < 1 || $notaField.val() == '') &&
     ($notaExameField.length < 1 || $notaExameField.val() == '') &&
     ($parecerField.length < 1 || $j.trim($parecerField.val()) == '')
    ) {
    var resourceName = 'falta';

    var additionalVars = {
      componente_curricular_id : $faltaFieldElement.data('componente_curricular_id'),
      matricula_id : $faltaFieldElement.data('matricula_id')
     };

    var options = {
      url : deleteResourceUrlBuilder.buildUrl(API_URL_BASE, resourceName, additionalVars),
      dataType : 'json',
      success : function(dataResponse) {
        afterChangeResource($faltaFieldElement);
        handleChange(dataResponse);
      }
    };

    deleteResource(resourceName, $faltaFieldElement, options, handleErrorOnDeleteResource);
  }
  else{

    $faltaFieldElement.val($faltaFieldElement.data('old_value'));

    handleMessages([{type : 'error', msg : safeUtf8Decode('Falta não pode ser removida após ter lançado notas ou parecer descritivo, tente definir como 0 (zero).')}], $faltaFieldElement.attr('id'));
  }
}


function deleteParecer($parecerFieldElement) {
  var resourceName = 'parecer';

  var additionalVars = {
    componente_curricular_id : $parecerFieldElement.data('componente_curricular_id'),
    matricula_id             : $parecerFieldElement.data('matricula_id'),
    etapa                    : getEtapaParecer()
   };

  var options = {
    url : deleteResourceUrlBuilder.buildUrl(API_URL_BASE, resourceName, additionalVars),
    dataType : 'json',
    success : function(dataResponse) {
      afterChangeResource($parecerFieldElement);
      handleChange(dataResponse);
    }
  };

  deleteResource(resourceName, $parecerFieldElement, options, handleErrorOnDeleteResource);
}


//callback handlers

function handleChange(dataResponse) {
  var targetId = dataResponse.resource + '-matricula-' + dataResponse.matricula_id +
                 '-cc-' + dataResponse.componente_curricular_id;
  handleMessages(dataResponse.msgs, targetId);
  updateResourceRow(dataResponse);
}


function setTableSearchDetails($tableSearchDetails, dataDetails) {
  var componenteCurricularSelected = ($j('#ref_cod_componente_curricular').val() != '');

  usaRecuperacaoParalelaPorEtapa = (dataDetails.tipo_recuperacao_paralela == 'por_etapa');

  $j('<caption />').html('<strong>Lan&#231;amento de notas por turma</strong>').appendTo($tableSearchDetails);

  //set headers table
  var $linha = $j('<tr />');

  if (componenteCurricularSelected) {
    $j('<th />').html('&Aacute;rea de Conhecimento').appendTo($linha);
    $j('<th />').html('Componente curricular').appendTo($linha);
  }

  $j('<th />').html('Etapa').appendTo($linha);
  $j('<th />').html('Turma').appendTo($linha);
  $j('<th />').html(safeUtf8Decode('Série')).appendTo($linha);
  $j('<th />').html('Ano').appendTo($linha);
  $j('<th />').html('Escola').appendTo($linha);
  $j('<th />').html('Regra avalia&#231;&#227;o').appendTo($linha);
  $j('<th />').html('Tipo nota').appendTo($linha);
  $j('<th />').html('Tipo presen&#231;a').appendTo($linha);
  $j('<th />').html('Tipo parecer').appendTo($linha);
  $j('<th />').html(safeUtf8Decode('Recuperação paralela')).appendTo($linha);

  $linha.appendTo($tableSearchDetails);

  var $linha = $j('<tr />').addClass('cellColor');

  if (componenteCurricularSelected) {
    $j('<td />').html(safeToUpperCase($j('#ref_cod_componente_curricular optgroup').children("[selected='selected']").parent().attr('label'))).appendTo($linha);
    $j('<td />').html(safeToUpperCase($j('#ref_cod_componente_curricular optgroup').children("[selected='selected']").html())).appendTo($linha);
  }

  $j('<td />').html(safeToUpperCase($j('#etapa').children("[selected='selected']").html())).appendTo($linha);
  $j('<td />').html(safeToUpperCase($j('#ref_cod_turma').children("[selected='selected']").html())).appendTo($linha);
  $j('<td />').html(safeToUpperCase($j('#ref_cod_serie').children("[selected='selected']").html())).appendTo($linha);
  $j('<td />').html($j('#ano').val()).appendTo($linha);

  //field escola pode ser diferente de select caso usuario comum
  var $htmlEscolaField = $j('#ref_cod_escola').children("[selected='selected']").html() ||
                         $j('#tr_nm_escola span:last').html();

  $j('<td />').html(safeToUpperCase($htmlEscolaField)).appendTo($linha);
  $j('<td />').html(dataDetails.id + ' - ' +safeToUpperCase(dataDetails.nome)).appendTo($linha);

  //corrige acentuação
  var tipoNota = dataDetails.tipo_nota.replace('_', ' ');
  if (tipoNota == 'numerica')
    tipoNota = 'numérica';
  $j('<td />').html(safeToUpperCase(safeUtf8Decode(tipoNota))).appendTo($linha);

  $j('<td />').html(safeToUpperCase(dataDetails.tipo_presenca.replace('_', ' '))).appendTo($linha);
  $j('<td />').html(safeToUpperCase(dataDetails.tipo_parecer_descritivo.replace('_', ' '))).appendTo($linha);
  $j('<td />').html(safeToUpperCase(dataDetails.tipo_recuperacao_paralela.replace('_', ' '))).appendTo($linha);

  mediaRecuperacaoParalela = dataDetails.media_recuperacao_paralela;

  $linha.appendTo($tableSearchDetails);
  $tableSearchDetails.show();

  nomenclatura_exame = dataDetails.nomenclatura_exame;

  //dataDetails.opcoes_notas = safeSortArray(dataDetails.opcoes_notas);
  $tableSearchDetails.data('details', dataDetails);
}

var nextTabIndex = 1;

function setNextTabIndex($element) {
  $element.attr('tabindex', nextTabIndex);
  $element.addClass('tabable');
  nextTabIndex += 1;
}

function handleSearch($resultTable, dataResponse) {

  // set nota limits on javascript variable
  window.notaLimits = dataResponse.nota_limits;

  var componenteCurricularSelected = ($j('#ref_cod_componente_curricular').val() != '');

  // resets next tabindex
  var nextTabIndex = 1;

  //set headers
  var $linha = $j('<tr />');
  $j('<th />').html(safeUtf8Decode('Matrícula')).appendTo($linha);
  $j('<th />').attr('colspan', componenteCurricularSelected ? 0 : 5).html('Aluno').appendTo($linha);

  if (componenteCurricularSelected)
    updateComponenteCurricularHeaders($linha, $j('<th />'));

  $linha.appendTo($resultTable);

  //set (result) rows
  $j.each(dataResponse.matriculas, function(index, value) {
    var $linha = $j('<tr />').addClass(componenteCurricularSelected ? '' : 'strong');



    $j('<td />').html(value.matricula_id).addClass('center').appendTo($linha);
    $j('<td />').html(value.aluno_id + ' - ' +safeToUpperCase(value.nome))
                .attr('colspan', componenteCurricularSelected ? 0 : 5)
                .appendTo($linha);

    if (value.componentes_curriculares){
      if (componenteCurricularSelected && value.componentes_curriculares.length > 0)
        updateComponenteCurricular($linha, value.matricula_id, value.componentes_curriculares[0]);
    }else{
      if(value.situacao_deslocamento){
        var $situacaoTdDeslocamento = $j('<td />').addClass('situacao-matricula-cc')
                                  .attr('id', 'situacao-matricula-' + value.matricula_id)
                                  .data('matricula_id', value.matricula_id)
                                  .addClass('center')
                                  .css('color', '#FF6600')
                                  .html(value.situacao_deslocamento)
                                  .appendTo($linha);

        var colCount = 0;
        $resultTable.find('tr:nth-child(1) th').each(function () {
          colCount++;
        });
        for (var i = 0; i < colCount - 3; i++) {
          $j('<td />').html('-').addClass('center').appendTo($linha);
        };
      }
    }

    $linha.fadeIn('slow').appendTo($resultTable);
    $linha.appendTo($resultTable);

    if (! componenteCurricularSelected && value.componentes_curriculares)
      updateComponenteCurriculares($resultTable, value.matricula_id, value.componentes_curriculares);

    if (!componenteCurricularSelected)
      criaBotaoReplicarNotasPorArea(value.componentes_curriculares);

  });

  // seta colspan [th, td].aluno quando exibe nota exame
  if ($tableSearchDetails.data('details').tipo_nota != 'nenhum' &&
      $tableSearchDetails.data('details').quantidade_etapas == $j('#etapa').val()) {
    $resultTable.find('[colspan]:not(.area-conhecimento)').attr('colspan', componenteCurricularSelected ? 1 : 7);
  }

  $resultTable.find('tr:even').addClass('even');

  //set onchange events
  var $notaFields = $resultTable.find('.nota-matricula-cc');
  var $notaExameFields = $resultTable.find('.nota-exame-matricula-cc');
  var $faltaFields = $resultTable.find('.falta-matricula-cc');
  var $parecerFields = $resultTable.find('.parecer-matricula-cc');
  var $notaRecuperacaoParalelaFields = $resultTable.find('.nota-recuperacao-paralela-cc');

  $notaFields.on('change', changeNota);
  $notaExameFields.on('change', changeNotaExame);
  $faltaFields.on('change', changeFalta);
  $parecerFields.on('change', changeParecer);
  $notaRecuperacaoParalelaFields.on('change', changeNotaRecuperacaoParalela);

  $resultTable.addClass('styled').find('.tabable:first').focus();
  navegacaoTab(dataResponse.navegacao_tab);
  if(!dataResponse.can_change){
    $j('#form_resultado input').attr('disabled', 'disabled');
    $j('#form_resultado select').attr('disabled', 'disabled');
    $j('#form_resultado textarea').attr('disabled', 'disabled');
  }else{
    $j('#form_resultado input').removeAttr('disabled');
    $j('#form_resultado select').removeAttr('disabled');
    $j('#form_resultado textarea').removeAttr('disabled');
  }
  if (componenteCurricularSelected)
    criaBotaoReplicarNotas();

}

function _notaField(matriculaId, componenteCurricularId, klass, id, value, areaConhecimentoId, maxLength) {
  if($tableSearchDetails.data('details').tipo_nota == 'conceitual') {
    var opcoesNotas = $tableSearchDetails.data('details').opcoes_notas;

    var $notaField = $j('<select />')
                     .addClass(klass)
                     .addClass(areaConhecimentoId)
                     .attr('id', id)
                     .data('matricula_id', matriculaId)
                     .data('componente_curricular_id', componenteCurricularId);

    // adiciona opcoes notas ao select
    var $option = $j('<option />').appendTo($notaField);
    for(key in opcoesNotas) {
      var $option = $j('<option />').val(key).html(opcoesNotas[key]);

      if (value == key)
        $option.attr('selected', 'selected');

      $option.appendTo($notaField);
    }
  }
  else {
    var $notaField = $j('<input />').addClass(klass)
                                    .attr('id', id)
                                    .attr('maxlength', maxLength)
                                    .attr('size', maxLength)
                                    .val(value)
                                    .data('matricula_id', matriculaId)
                                    .data('componente_curricular_id', componenteCurricularId);
  }

  $notaField.data('old_value', value);
  setNextTabIndex($notaField);

  return $j('<td />').html($notaField).addClass('center');
}


function notaField(matriculaId, componenteCurricularId, value, areaConhecimentoId, maxLength) {
  return _notaField(matriculaId,
                    componenteCurricularId,
                    'nota-matricula-cc',
                    'nota-matricula-' + matriculaId + '-cc-' + componenteCurricularId,
                    value,
                    'area-id-' + areaConhecimentoId,
                    maxLength);
}


function notaExameField(matriculaId, componenteCurricularId, value, maxLength) {
  return _notaField(matriculaId,
                    componenteCurricularId,
                    'nota-exame-matricula-cc',
                    'nota-exame-matricula-' + matriculaId + '-cc-' + componenteCurricularId,
                    value,
                    null,
                    maxLength);
}

function notaNecessariaField(matriculaId, componenteCurricularId, value){
  if (value=='' || value==undefined) value = '-';
  var $notaNecessariaField = $j('<span />').addClass('nn-matricula-cc')
                                   .addClass('nn-matricula-' + matriculaId + '-cc')
                                   .attr('id', 'nn-matricula-' + matriculaId + '-cc-' + componenteCurricularId)
                                   .text(value);
  setNextTabIndex($notaNecessariaField);
  return $j('<td />').html($notaNecessariaField).addClass('center');
}


function faltaField(matriculaId, componenteCurricularId, value) {
  var $faltaField = $j('<input />').addClass('falta-matricula-cc')
                                   .addClass('falta-matricula-' + matriculaId + '-cc')
                                   .attr('id', 'falta-matricula-' + matriculaId + '-cc-' + componenteCurricularId)
                                   .attr('maxlength', '4')
                                   .attr('size', '4')
                                   .val(value)
                                   .data('old_value', value)
                                   .data('matricula_id', matriculaId)
                                   .data('componente_curricular_id', componenteCurricularId);

  setNextTabIndex($faltaField);
  return $j('<td />').html($faltaField).addClass('center');
}

function parecerField(matriculaId, componenteCurricularId, value) {
  var $parecerField = $j('<textarea />').attr('cols', '40')
                                        .attr('rows', '5')
                                        .addClass('parecer-matricula-cc')
                                        .addClass('parecer-matricula-' + matriculaId + '-cc')
                                        .attr('id', 'parecer-matricula-' + matriculaId + '-cc-' + componenteCurricularId)
                                        .val(value)
                                        .data('old_value', value)
                                        .data('matricula_id', matriculaId)
                                        .data('componente_curricular_id', componenteCurricularId);

  setNextTabIndex($parecerField);
  return $j('<td />').addClass('center').html($parecerField);
}

function notaRecuperacaoParalelaField(matriculaId, componenteCurricularId, value, areaConhecimentoId, maxLength) {
  return _notaField(matriculaId,
                    componenteCurricularId,
                    'nota-recuperacao-paralela-cc',
                    'nota-recuperacao-paralela-' + matriculaId + '-cc-' + componenteCurricularId,
                    value,
                    'area-id-' + areaConhecimentoId,
                    maxLength);
}

function getNotaGeralMaxLength(){
  return window.notaLimits.nota_maxima_geral.toString().length + window.notaLimits.qtd_casas_decimais + 1;
}

function getNotaExameFinalMaxLength(){
  return window.notaLimits.nota_maxima_exame_final.toString().length + window.notaLimits.qtd_casas_decimais + 1;
}


function updateComponenteCurricular($targetElement, matriculaId, cc) {
  var useNota                = $tableSearchDetails.data('details').tipo_nota != 'nenhum';
  var useParecer             = $tableSearchDetails.data('details').tipo_parecer_descritivo != 'nenhum';

  var $situacaoTd = $j('<td />').addClass('situacao-matricula-cc')
                                .attr('id', 'situacao-matricula-' + matriculaId + '-cc-' + cc.id)
                                .data('matricula_id', matriculaId)
                                .data('componente_curricular_id', cc.id)
                                .addClass('center')
                                .html(cc.situacao)
                                .appendTo($targetElement);

  colorizeSituacaoTd($situacaoTd, cc.situacao);

  if(useNota) {

    if(usaRecuperacaoParalelaPorEtapa){
      notaField(matriculaId, cc.id, cc.nota_original, cc.area_id, getNotaGeralMaxLength()).appendTo($targetElement);

      hasNotaRecuperacaoParalela = (cc.nota_recuperacao_paralela != '');
      hasMediaRecuperacaoParalela = (mediaRecuperacaoParalela != null);
      hasNotaAtual = !!cc.nota_atual;

      $notaRecuperacaoParalelaField = notaRecuperacaoParalelaField(matriculaId, cc.id, cc.nota_recuperacao_paralela, cc.area_id, getNotaGeralMaxLength());
      $notaRecuperacaoParalelaField.appendTo($targetElement);

      shouldShowNotaRecuperacaoParalela = (((hasNotaRecuperacaoParalela) ||
                                           (cc.nota_original < mediaRecuperacaoParalela) ||
                                           (!hasMediaRecuperacaoParalela)) &&
                                           (hasNotaAtual));

      if(!shouldShowNotaRecuperacaoParalela){
        $notaRecuperacaoParalelaField.children().hide();
      }
    }else{
      notaField(matriculaId, cc.id, cc.nota_atual, cc.area_id, getNotaGeralMaxLength()).appendTo($targetElement);
    }

    // mostra nota exame caso estiver selecionado a ultima etapa
    if ($tableSearchDetails.data('details').quantidade_etapas == $j('#etapa').val()) {
      var $fieldNotaExame = notaExameField(matriculaId, cc.id, cc.nota_exame, getNotaExameFinalMaxLength());

      var $fieldNN = notaNecessariaField(matriculaId, cc.id, cc.nota_necessaria_exame);

      if (cc.nota_exame == '' && safeToLowerCase(cc.situacao) != 'em exame'){
        $fieldNotaExame.children().hide();
        $fieldNN.children().text('-');
      }

      $fieldNotaExame.appendTo($targetElement);

      // Adiciona campo com nota necessária

      $fieldNN.appendTo($targetElement);
    }

  }

  faltaField(matriculaId, cc.id, cc.falta_atual).appendTo($targetElement);

  if (useParecer)
    parecerField(matriculaId, cc.id, cc.parecer_atual).appendTo($targetElement);
}

function updateComponenteCurricularHeaders($targetElement, $tagElement) {
  var useNota                = $tableSearchDetails.data('details').tipo_nota != 'nenhum';
  var useParecer             = $tableSearchDetails.data('details').tipo_parecer_descritivo != 'nenhum';

  $tagElement.clone().addClass('center').html(safeUtf8Decode('Situação')).appendTo($targetElement);

  if (useNota) {
    $tagElement.clone().addClass('center').html('Nota').appendTo($targetElement);

    if(usaRecuperacaoParalelaPorEtapa){
      $tagElement.clone().addClass('center').html(safeUtf8Decode('Recuperação paralela')).appendTo($targetElement);
    }
    if ($tableSearchDetails.data('details').quantidade_etapas == $j('#etapa').val()){
      $tagElement.clone().addClass('center').html('Nota '+nomenclatura_exame).appendTo($targetElement);
      $tagElement.clone().addClass('center').html(safeUtf8Decode('Nota necessária no '+nomenclatura_exame)).appendTo($targetElement);
    }
  }

  $tagElement.clone().addClass('center').html('Falta').appendTo($targetElement);

  if (useParecer)
    $tagElement.clone().addClass('center').html('Parecer descritivo').appendTo($targetElement);
}

function updateComponenteCurriculares($targetElement, matriculaId, componentesCurriculares) {
  var useNota                = $tableSearchDetails.data('details').tipo_nota != 'nenhum';
  var useParecer             = $tableSearchDetails.data('details').tipo_parecer_descritivo != 'nenhum';

  var areas = new Array();

  var setaDireita = "<img src=\"imagens/mytdt/seta-preta-direita.png\" align=\"top\" class=\"area-conhecimento-seta seta-direita\" />";
  var setaBaixo   = "<img src=\"imagens/mytdt/seta-branca-baixo.png\" align=\"top\" class=\"area-conhecimento-seta seta-baixo\" />";

  $j.each(componentesCurriculares, function(index, cc) {

    if (areas.indexOf(cc.area_id) == -1) {
      areas.push(cc.area_id);

      //primeiro o header para calcular o colspan
      var $ccHeader = $j('<tr />').addClass('strong').addClass('tr-componente-curricular').data('areaid', cc.area_id);
      $j('<td />').addClass('center').html('Componente curricular').appendTo($ccHeader);
      updateComponenteCurricularHeaders($ccHeader, $j('<td />'));

      //pegando o colspan
      var areaColspan = $j('td', $ccHeader).length;

      var $areaRow = $j('<tr />').addClass('tr-area-conhecimento').data('areaid', cc.area_id);
      var conteudo = setaDireita + setaBaixo + " " + cc.area_nome;
      $j('<td />').addClass('area-conhecimento').attr('colspan', areaColspan).html(conteudo).appendTo($areaRow);

      //por fim adicionando primeiro a área depois o heade
      $areaRow.appendTo($targetElement);
      $ccHeader.appendTo($targetElement);
     }

    var $ccRow = $j('<tr />').addClass('tr-componente-curricular').data('areaid', cc.area_id);

    $j('<td />').addClass('center').html(cc.nome).appendTo($ccRow);
    updateComponenteCurricular($ccRow, matriculaId, cc);

    $ccRow.appendTo($targetElement);
  });

  $j('.tr-area-conhecimento').bind('click', function() {

    $j('td', this).toggleClass('area-conhecimento-destaque');

    var fechado = $j('.seta-baixo', this).is(':hidden');
    if (fechado) {
      $j('.seta-baixo', this).css('display', 'inline');
      $j('.seta-direita', this).css('display', 'none');
    } else {
      $j('.seta-baixo', this).css('display', 'none');
      $j('.seta-direita', this).css('display', 'inline');
    }

    var id = $j(this).data('areaid');
    $j('.tr-componente-curricular').each(function() {
      if ($j(this).data('areaid') == id) {
        if ($j(this).is(':hidden')) {
          $j(this).slideRow('down');
        } else {
          $j(this).slideRow('up');
        }
      }
    });
  });
  $j('.tr-area-conhecimento').first().trigger('click');
}


function updateResourceRow(dataResponse) {
  var matriculaId     = dataResponse.matricula_id;
  var ccId            = dataResponse.componente_curricular_id;

  var $situacaoField  = $j('#situacao-matricula-' + matriculaId + '-cc-' + ccId);
  var $fieldNotaExame = $j('#nota-exame-matricula-' + matriculaId + '-cc-' + ccId);
  var $fieldNN = $j('#nn-matricula-' + matriculaId + '-cc-' + ccId);

  $situacaoField.html(dataResponse.situacao);
  colorizeSituacaoTd($situacaoField.closest('td'), dataResponse.situacao);

  if (! $fieldNotaExame.is(':visible') &&
     ($fieldNotaExame.val() != '' || safeToLowerCase(dataResponse.situacao) == 'em exame')) {

    $fieldNotaExame.show();
    $fieldNotaExame.focus();
    $fieldNN.text(dataResponse.nota_necessaria_exame);
  }
  else if($fieldNotaExame.val() == '' && safeToLowerCase(dataResponse.situacao) != 'em exame'){
    $fieldNotaExame.hide();
    $fieldNN.text('-');
  }else
    $fieldNN.text(dataResponse.nota_necessaria_exame);
}

function colorizeSituacaoTd(tdElement, situacao) {
  if (safeToLowerCase(situacao) == 'retido')
    $j(tdElement).addClass('error');
  else
    $j(tdElement).removeClass('error');
}

function canSearch(){

  if ($j('#ref_cod_matricula').val() == '' &&  $j('#ref_cod_componente_curricular').val() == '') {
    alert(safeUtf8Decode('Selecione um Componente curricular e/ou uma Matrícula'));
    return false;
  }

  return true;
}

function myNextValid($selectElement) {
  var a = $selectElement.find('option:selected');
  if (a.next('option').length == 0) {
    b = a.parent();
    if (b.prop('tagName').toUpperCase() == 'SELECT') {
      return null;
    } else {
      return b.next().children('option:first');
    }
  } else {
    return a.next('option');
  }
}

function selectNextOption($selectElement){
  var $nextOption = myNextValid($selectElement);

  if ($nextOption.val() != undefined) {
    $selectElement.val($nextOption.val());

    clearSearchResult();
    $j('#botao_busca').click();
  }

  else {
    alert(safeUtf8Decode('Você chegou à última opção.'));
    showSearchForm();
  }
}

function nextComponenteCurricular(){
  selectNextOption($j('#ref_cod_componente_curricular'));
}

function nextMatricula(){
  selectNextOption($j('#ref_cod_matricula'));
}

function showNextSelectionButton() {
  var $ccField        = $j('#ref_cod_componente_curricular');
  var $matriculaField = $j('#ref_cod_matricula');

  if ($ccField.val() != '') {
    $j("<a href='#'>Pr&#243;ximo componente curricular</a>").bind('click', nextComponenteCurricular)
                                .attr('style', 'text-decoration: underline')
                                .appendTo($navActions);
  }

  if ($matriculaField.val() != '') {
    $j("<a href='#'>Pr&#243;xima matr&#237;cula</a>").bind('click', nextMatricula)
                                .attr('style', 'text-decoration: underline')
                                .appendTo($navActions);
  }
}

function navegacaoTab(sentido){
    //se for no sentido vertical
    if(sentido=="2"){
        i = 1;

      $j(document).find('.nota-matricula-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
      $j(document).find('.nota-recuperacao-paralela-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
      $j(document).find('.nota-exame-matricula-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
      $j(document).find('.nn-matricula-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
      $j(document).find('.falta-matricula-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
      $j(document).find('.parecer-matricula-cc').each(function(){
        $j(this).attr('tabindex', i);
        i++;
      });
    }

    sentidoTab = sentido;
}

function criaBotaoReplicarNotasPorArea(componentesCurriculares){

  var uniqueAreaConhecimento = [];

  $j.each(componentesCurriculares, function(index, element){
    if ($j.inArray(element.area_id, uniqueAreaConhecimento) == -1) uniqueAreaConhecimento.push(element.area_id);
  });

  $j.each(uniqueAreaConhecimento, function(index, value) {

    $j('<button/>').html('Replicar a todos')
                   .attr('type','button')
                   .attr('id','replicar-todas-notas-' + value)
                   .addClass('submit')
                   .appendTo($j('<p/>').insertAfter($j('.area-id-' + value)
                                       .first()))
                   .unbind();
    $j('#replicar-todas-notas-' + value).on('click', function(){
      $j('.area-id-' + value).val($j('.area-id-' + value).first().val())
                                   .trigger('change');
    });
  });
}
function criaBotaoReplicarNotas(){
  if($j('.nota-matricula-cc').length > 1){
    $j('<button/>').html('Replicar a todos')
                   .attr('type','button')
                   .attr('id','replicar-todas-notas')
                   .addClass('submit')
                   .appendTo($j('<p/>').insertAfter($j('.nota-matricula-cc')
                                       .first()))
                   .unbind();
    $j('#replicar-todas-notas').on('click', function(){
      $j('.nota-matricula-cc').val($j('.nota-matricula-cc').first().val())
                                   .trigger('change');
    });
  }
}


(function($) {
  var sR = {
      defaults: {
          slideSpeed: 400,
          easing: false,
          callback: false
      },
      thisCallArgs: {
          slideSpeed: 400,
          easing: false,
          callback: false
      },
      methods: {
          up: function (arg1,arg2,arg3) {
              if(typeof arg1 == 'object') {
                  for(p in arg1) {
                      sR.thisCallArgs.eval(p) = arg1[p];
                  }
              }else if(typeof arg1 != 'undefined' && (typeof arg1 == 'number' || arg1 == 'slow' || arg1 == 'fast')) {
                  sR.thisCallArgs.slideSpeed = arg1;
              }else{
                  sR.thisCallArgs.slideSpeed = sR.defaults.slideSpeed;
              }

              if(typeof arg2 == 'string'){
                  sR.thisCallArgs.easing = arg2;
              }else if(typeof arg2 == 'function'){
                  sR.thisCallArgs.callback = arg2;
              }else if(typeof arg2 == 'undefined') {
                  sR.thisCallArgs.easing = sR.defaults.easing;
              }
              if(typeof arg3 == 'function') {
                  sR.thisCallArgs.callback = arg3;
              }else if(typeof arg3 == 'undefined' && typeof arg2 != 'function'){
                  sR.thisCallArgs.callback = sR.defaults.callback;
              }
              var $cells = $(this).find('td');
              $cells.wrapInner('<div class="slideRowUp" />');
              var currentPadding = $cells.css('padding');
              $cellContentWrappers = $(this).find('.slideRowUp');
              $cellContentWrappers.slideUp(sR.thisCallArgs.slideSpeed,sR.thisCallArgs.easing).parent().animate({
                                                                                                                  paddingTop: '0px',
                                                                                                                  paddingBottom: '0px'},{
                                                                                                                  complete: function () {
                                                                                                                      $(this).children('.slideRowUp').replaceWith($(this).children('.slideRowUp').contents());
                                                                                                                      $(this).parent().css({'display':'none'});
                                                                                                                      $(this).css({'padding': currentPadding});
                                                                                                                  }});
              var wait = setInterval(function () {
                  if($cellContentWrappers.is(':animated') === false) {
                      clearInterval(wait);
                      if(typeof sR.thisCallArgs.callback == 'function') {
                          sR.thisCallArgs.callback.call(this);
                      }
                  }
              }, 100);
              return $(this);
          },
          down: function (arg1,arg2,arg3) {
              if(typeof arg1 == 'object') {
                  for(p in arg1) {
                      sR.thisCallArgs.eval(p) = arg1[p];
                  }
              }else if(typeof arg1 != 'undefined' && (typeof arg1 == 'number' || arg1 == 'slow' || arg1 == 'fast')) {
                  sR.thisCallArgs.slideSpeed = arg1;
              }else{
                  sR.thisCallArgs.slideSpeed = sR.defaults.slideSpeed;
              }

              if(typeof arg2 == 'string'){
                  sR.thisCallArgs.easing = arg2;
              }else if(typeof arg2 == 'function'){
                  sR.thisCallArgs.callback = arg2;
              }else if(typeof arg2 == 'undefined') {
                  sR.thisCallArgs.easing = sR.defaults.easing;
              }
              if(typeof arg3 == 'function') {
                  sR.thisCallArgs.callback = arg3;
              }else if(typeof arg3 == 'undefined' && typeof arg2 != 'function'){
                  sR.thisCallArgs.callback = sR.defaults.callback;
              }
              var $cells = $(this).find('td');
              $cells.wrapInner('<div class="slideRowDown" style="display:none;" />');
              $cellContentWrappers = $cells.find('.slideRowDown');
              $(this).show();
              $cellContentWrappers.slideDown(sR.thisCallArgs.slideSpeed, sR.thisCallArgs.easing, function() { $(this).replaceWith( $(this).contents()); });

              var wait = setInterval(function () {
                  if($cellContentWrappers.is(':animated') === false) {
                      clearInterval(wait);
                      if(typeof sR.thisCallArgs.callback == 'function') {
                          sR.thisCallArgs.callback.call(this);
                      }
                  }
              }, 100);
              return $(this);
          }
      }
  };

  $.fn.slideRow = function(method,arg1,arg2,arg3) {
      if(typeof method != 'undefined') {
          if(sR.methods[method]) {
              return sR.methods[method].apply(this, Array.prototype.slice.call(arguments,1));
          }
      }
  };
})(jQuery);