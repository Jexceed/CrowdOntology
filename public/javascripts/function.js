/*
 * 点击事件和函数
 */

var clicks = 0;
var mutex = 0;
$(function () {

    //使得提示工具Tooltip生效
    $('[data-tooltip="tooltip"]').tooltip()

    $(document).on("click", '#stigmod-search-left-btn', function () {
        let value = $(this).parent().parent().children("input[type=text]").val();

    })

    /*
    * 主区域
    * */
    //点击索引
    $(document).on("click", '.index li', function () {
        let id = $(this).attr("nodeid");
        drawEntity(id, instance_model); //画出中心区域
        $("#" + id).click();    //点击中心节点
    })

    //单击节点
    $(document).on("click", 'g', function () {
        let item = this;
        if(d3.select(this).classed("isRecommendation") == true){
            clickTimeout.set(function () {
                let id = $(item).attr('id');
                alert("显示推荐节点详情");
            });
        }else{
            clickTimeout.set(function () {
                let id = $(item).attr('id');
                if(instance_model.nodes[id] == undefined){
                    $(".properties-revise .button-left").click();
                    $(property).children().remove();
                    drawIndex();
                    drawEntity(nodeId);
                    $(graph).children().remove();
                }else{
                    drawNodeDetails(id);
                }
            });
        }
    })

    //双击节点
    $(document).on("dblclick", 'g', function () {
        if (d3.select(this).classed("isRecommendation") == true) { //双击推荐信息 -> 引用推荐
            clickTimeout.clear();
            //引用推荐节点
            let nodeID = $(this).attr("id");

            if(instance_model["nodes"][nodeID] == undefined){   //不存在节点的话创建

                if(isEntity(nodeID,recommend_model)){//是实体节点，需要创建3重信息

                    let value = recommend_model["nodes"][nodeID].value
                    let entity = {
                        tags: recommend_model["nodes"][nodeID].tags,
                        value: value,
                        nodeId: nodeID,
                        valueId: generateFrontNodeID(value,"v"),
                        relationId: generateFrontRelationID()
                    }
                    io_create_insModel_entity(entity);

                }else{//不是实体节点，需要创建节点信息
                    let value = recommend_model["nodes"][nodeID].value
                    let nodes = {};
                    let nodeId = generateFrontNodeID(value)
                    nodes[nodeId] = {
                        "dataType": recommend_model["nodes"][nodeID].tags,
                        "value": value
                    }
                    io_create_insModel_node(nodes)
                }
            }
            //创建关系
            let centerId = $("g.center").attr("id");
            let relationsArray = getRelations(centerId,nodeID,recommend_model);

            let relations;
            for(let n in relationsArray){
                relations = {};
                relations[relationsArray[n]] = recommend_model["relations"][relationsArray[n]];
                io_create_insModel_relation(relations);
            }
        } else {
            if (d3.select(this).classed("isCentralized") == false) {
                return;
            }
            clickTimeout.clear();

            let nodeID = $(this).attr("id");
            let node = {}
            node[nodeID] = instance_model.nodes[nodeID];
            io_recommend_insModel_node(node);
        }
    })

    //点击关系文本
    $(document).on("click", 'textPath', function () {
        //$(this).prev("path").click();
        $($(this).attr("href")).click();
    })

    //点击关系
    $(document).on("click", 'path', function () {
        let item = this;
        let id = $(item).attr('id');
        drawPathDetails(id);
    })

    /*
     * 右侧栏
     * */
    // 右划
    $(document).on("click", '.properties .button-right', function () {
        let item = $(this).parent().parent().parent().parent();
        $(item).children(".properties").hide();
        $(item).children(".properties-revise").show();
    })
    // 左划
    $(document).on("click", '.properties-revise .button-left', function () {
        let item = $(this).parent().parent().parent().parent();
        $(item).children(".properties").show();
        $(item).children(".properties-revise").hide();
    })

    // 点击添加
    $(document).on("click", '.fa-plus', function () {

        $(".properties .active").removeClass("active");

        let type = $(this).attr("type");
        switch (type) {
            case "class":
                classRevise(this, "add");
                break;
            case "attribute":
                attributeRevise(this, "add");
                break;
            case "relation":
                relationRevise(this, "add");
                break;
            case "role":
                break;
        }
    });

    // 点击属性修改
    $(document).on("click", '#attribute .fa-edit', function () {

        let item = $(this).parent().parent();

        let type = $(item).find(".type").attr("value");
        let value = $(item).find(".value").attr("value");

        $(item).parent().find('.fa-plus').click();
        $(".properties-revise").find(".type-input").val(type);
        $(".properties-revise").find(".value-input").val(value);

        $(item).addClass("active");

        //给一个标志位吧
    });

    // 点击关系修改
    $(document).on("click", '#relation .fa-edit', function () {

        let item = $(this).parent().parent();

        let type = $(item).find(".type").attr("value");
        let value = $(item).find(".value").attr("value");

        $(item).parent().find('.fa-plus').click();
        $(".properties-revise").find(".type-input").val(type);
        $(".properties-revise").find(".value-input").val(value);

        $(item).addClass("active");

    });

    // 点击修改成功
    $(document).on("click", '.properties-revise .glyphicon-ok', function () {
        //alert("修改成功");
        let item = $(this).parent().parent();
        switch ($(item).attr("id")) {
            case "class-revise":
                classReviseSubmit(item);
                break;
            case "attribute-revise":
                attributeReviseSubmit(item);
                break;
            case "relation-revise":
                relationReviseSubmit(item);
                break;
        }
    });

    // 点击修改取消
    $(document).on("click", '.properties-revise .glyphicon-ban-circle', function () {
        let item = $(this).parent().parent();
        switch ($(item).attr("id")) {
            case "class-revise":
                break;
            case "attribute-revise":
                $(".properties-revise .button-left").click();
                break;
            case "relation-revise":
                $(".properties-revise .button-left").click();
                break;
        }
    });

    // 点击修改删除
    $(document).on("click", '.properties-revise .glyphicon-remove', function () {
        let item = $(this).parent().parent().children(".list-group");
        switch ($(item).attr("id")) {
            case "class-revise":
                break;
            case "attribute-revise":
                attributeRemoveSubmit(item);
                break;
            case "relation-revise":
                //$(".properties-revise .button-left").click();
                relationRemoveSubmit(item);
                break;
        }
    });
});

/*
* 右侧区域的绘制
* */
function drawNodeDetails(id) {
    let isEntity = drawEntity(id, instance_model);
    if (isEntity) {
        //处理后面
        $(".properties-revise .button-left").click();
        $(property).children().remove();
        drawPropertyTitle();
        drawTypes(id);
        drawAttributes(id);
        drawRelations(id);
    }
}


function drawPathDetails(id) {
    let nodeIDs = getEntityIdByRelation(id, instance_model);

    if(nodeIDs == undefined) return;

    if (nodeIDs.length > 2) {
        alert("多元关系");
        return;
    }
    //以下只处理了二元关系
    //如果是属性则不做处理
    let entity1 = getEntity(nodeIDs[0], instance_model);
    let entity2 = getEntity(nodeIDs[1], instance_model);

    if (entity1 == undefined || entity2 == undefined) return;
    //如果是关系则进行绘制
    drawRelation(nodeIDs[0], nodeIDs[1], instance_model);
    //关系的属性处理
    $(property).children().remove();
    drawPropertyTitle();
    drawTypes(id);
    drawRoles(id);

    $("#"+id).css("stroke-width",2.5);
}

function drawRecommendDetail(){
    //如果是属性
    //如果是节点
}

function drawPropertyTitle() {
    $(property).append('<div class="row">' +
        '<div class="col-xs-2"><!--span class="glyphicon glyphicon-chevron-left button-left"></span--></div>' +
        '<div class="col-xs-8"><h4>详情</h4></div>' +
        '<div class="col-xs-2"><!--span class="glyphicon glyphicon-chevron-right button-right"></span--></div>' +
        '</div>' +
        '<hr class="stigmod-hr-narrow">');
}

function drawTypes(id) {
    let html = generateTitle("类型", "type");
    $(property).append(html);

    let type, value;
    if (instance_model.nodes[id]) {
        type = "实体";
        value = instance_model.nodes[id].tags
    }
    if (instance_model.relations[id]) {
        type = "关系";
        value = instance_model.relations[id].type
    }
    html = generateContent(type, value, 1);
    $(property).find("#type").append(html);
    $(property).find("#type").children().last().find(".stigmod-hovershow-cont").hide();
}

function drawAttributes(id) {

    let html = generateTitle("属性", "attribute");
    $(property).append(html);

    let entity = getEntity(id, instance_model);
    let attributes = filterAttributes(entity.neighbours);
    html = "";
    html += generateContent(instance_model.nodes[id].dataType, instance_model.nodes[id].value);
    for (let attribute of attributes) {
        html += generateContent(attribute.type, attribute.value, attribute.nodeID, attribute.relationID);
    }
    $(property).find("#attribute").append(html);

    $(property).find("#attribute").append(generatePlusLogo("attribute"));

}

function drawRelations(id) {

    let html = generateTitle("关系", "relation");
    $(property).append(html);


    let entity = getEntity(id, instance_model);
    let relations = filterRelations(entity.neighbours);
    html = "";
    for (let relation of relations) {
        html += generateContent(relation.type, relation.value, relation.nodeID, relation.relationID);
    }
    $(property).find("#relation").append(html);

    $(property).find("#relation").append(generatePlusLogo("relation"));

}

function drawRoles(id) {
    let html = generateTitle("角色", "role");
    $(property).append(html);

    let roles = getRoles(instance_model.relations[id]);
    html = "";
    for (let role of roles) {
        html = generateContent(role.type, role.value);
        $(property).find("#role").append(html);
    }
}

function classRevise(item, type = "add") {
    $(".properties").hide();
    $(".properties-revise").show();
    $(".properties-revise").children().remove();
    let html = '<div class="row">' +
        '<div class="col-xs-2"><span class="glyphicon glyphicon-chevron-left button-left" style="display: none"></span></div>' +
        '<div class="col-xs-8"><h4>添加</h4></div>' +
        '<div class="col-xs-2"></div>' +
        '</div>' +
        '<hr style="margin:8px">';
    $(".properties-revise").append(html);


    html = generateTitle("实体", "class-revise");
    $(".properties-revise").append(html);

    html = '<a href="#" class="list-group-item stigmod-hovershow-trig">' +
        '<div class="row">' +
        '<div class="col-xs-4" style="padding: 3px"><input type="text" class="stigmod-input type-input" stigmod-inputcheck="class-modify" value="" placeholder="类型"></div>' +
        '<div class="col-xs-8" style="padding: 3px"><input type="text" class="stigmod-input value-input" stigmod-inputcheck="class-modify" value="" placeholder="名称:String"></div>' +
        '</div></a>';
    $(".properties-revise").find("#class-revise").append(html);

    html = generateSubmitLogo();
    $(".properties-revise").find("#class-revise").append(html);

    let array = getEntityTypes();
    setClassTypeTypeahead(array);
}

function attributeRevise(item, type = "add") {
    $(".properties").hide();
    $(".properties-revise").show();
    $(".properties-revise").children().remove();
    let html = '<div class="row">' +
        '<div class="col-xs-2"><span class="glyphicon glyphicon-chevron-left button-left"></span></div>' +
        '<div class="col-xs-8"><h4>修改</h4></div>' +
        '<div class="col-xs-2"></div>' +
        '</div>' +
        '<hr style="margin:8px">';
    $(".properties-revise").append(html);


    html = generateXTitle("属性", "attribute-revise");
    $(".properties-revise").append(html);

    html = '<a href="#" class="list-group-item stigmod-hovershow-trig">' +
        '<div class="row">' +
        '<div class="col-xs-4" style="padding: 3px"><input type="text" class="stigmod-input type-input" stigmod-inputcheck="attribute-modify" value="" placeholder="类型"></div>' +
        '<div class="col-xs-8" style="padding: 3px"><input type="text" class="stigmod-input value-input" stigmod-inputcheck="attribute-modify" value="" placeholder="属性值:String"></div>' +
        '</div></a>';
    $(".properties-revise").find("#attribute-revise").append(html);

    html = generateSubmitLogo();
    $(".properties-revise").find("#attribute-revise").append(html);

    let centerId = $("g.center.isCentralized").attr("id");
    let array = getAttributeTypes(centerId);
    setAttributeTypeTypeahead(array);
}


function relationRevise(item, type = "add") {
    $(".properties").hide();
    $(".properties-revise").show();
    $(".properties-revise").children().remove();
    let html = '<div class="row">' +
        '<div class="col-xs-2"><span class="glyphicon glyphicon-chevron-left button-left"></span></div>' +
        '<div class="col-xs-8"><h4>修改</h4></div>' +
        '<div class="col-xs-2"></div>' +
        '</div>' +
        '<hr style="margin:8px">';
    $(".properties-revise").append(html);


    html = generateXTitle("关系", "relation-revise");
    $(".properties-revise").append(html);

    html = '<a href="#" class="list-group-item stigmod-hovershow-trig">' +
        '<div class="row">' +
        '<div class="col-xs-4" style="padding: 3px"><input type="text" class="stigmod-input type-input typeahead" stigmod-inputcheck="relation-modify" value="" placeholder="关系"></div>' +
        '<div class="col-xs-8" style="padding: 3px"><input type="text" class="stigmod-input value-input typeahead" stigmod-inputcheck="relation-modify" value="" placeholder="对象"></div>' +
        '</div></a>';
    $(".properties-revise").find("#relation-revise").append(html);

    html = generateSubmitLogo();
    $(".properties-revise").find("#relation-revise").append(html);

    /*
        let array = ["兄妹", "排行"]
        setRelationTypeTypeahead(array);
        array = ["贾宝玉", "林黛玉"]
        setRelationValueTypeahead(array);
    */
    let centerId = $("g.center.isCentralized").attr("id");
    let array = getRelationTypes(centerId);
    setRelationTypeTypeahead(array);

    array = getRelationValues(centerId)
    setRelationValueTypeahead(array);
}

function rolseRevise(item, type = "add") {
    $(".properties").hide();
    $(".properties-revise").show();
    $(".properties-revise").children().remove();
    let html = '<div class="row">' +
        '<div class="col-xs-2"><span class="glyphicon glyphicon-chevron-left button-left"></span></div>' +
        '<div class="col-xs-8"><h4>修改</h4></div>' +
        '<div class="col-xs-2"></div>' +
        '</div>' +
        '<hr style="margin:8px">';
    $(".properties-revise").append(html);


    html = generateTitle("角色", "role-revise");
    $(".properties-revise").append(html);

    html = '<a href="#" class="list-group-item stigmod-hovershow-trig">' +
        '<div class="row">' +
        '<div class="col-xs-4" style="padding: 3px"><input type="text" class="stigmod-input type-input typeahead" stigmod-inputcheck="relation-modify" value="" placeholder="角色"></div>' +
        '<div class="col-xs-8" style="padding: 3px"><input type="text" class="stigmod-input value-input typeahead" stigmod-inputcheck="relation-modify" value="" placeholder="对象"></div>' +
        '</div></a>';
    $(".properties-revise").find("#role-revise").append(html);

    html = generateSubmitLogo();
    $(".properties-revise").find("#role-revise").append(html);

}

function generateTitle(title, type) {
    let html = '<div class="panel panel-default">' +
        '<div class="panel-heading">' +
        '<div class="panel-title stigmod-rcmd-title">' + title + '</div>' +
        //'<span class="panel-title stigmod-rcmd-title" style="margin-left: 30%;margin-right: 25%">' + title + '</span>' +
        //'<span class="glyphicon glyphicon-remove" type="remove" ></span>' +
        '</div>' +
        '<div class="list-group" id=' + type + '></div>' +
        '</div>';
    return html

}

function generateXTitle(title, type) {
    let html = '<div class="panel panel-default">' +
        '<div class="panel-heading">' +
        '<span class="panel-title stigmod-rcmd-title" style="margin-left: 30%;margin-right: 25%">' + title + '</span>' +
        '<span class="glyphicon glyphicon-remove" type="remove" style="z-index: 2"></span>' +
        '</div>' +
        '<div class="list-group" id=' + type + '></div>' +
        '</div>';
    return html

}

function generateContent(type, value, nodeID = "", relationID = "") {
    if(type == undefined) type="姓名";
    //alert(nodeID);
    //alert(relationID);
    let html = '<a href="#" class="list-group-item stigmod-hovershow-trig">' +
        '<span class="nodeID" value=' + nodeID + '></span>' +
        '<span class="relationID" value=' + relationID + '></span>' +
        '<span class="type" value=' + type + '>' + type + '</span>' + ' : ' +
        '<span class="value" value=' + value + '>' + value + '</span>' +
        '<span class="pull-right stigmod-hovershow-cont">' +
        '<span class="fa fa-edit"></span>' +
        '</span></a>';
    return html;
}

function generatePlusLogo(type) {
    let html = '<a href="#" class="list-group-item stigmod-hovershow-trig" style="text-align: center">' +
        '<span class="fa fa-plus" type=' + type + '></span></a>';
    return html;
}

function generateSubmitLogo() {
    let html = '<a href="#" class="list-group-item stigmod-hovershow-trig" style="text-align: center">' +
        '<span class="glyphicon glyphicon-ok" type="ok"></span>' +
        '<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
        '<span class="glyphicon glyphicon-ban-circle" type="cancel"></span>' +
        '</a>';
    return html;
}

function generateIndex(text, nodeID) {
    var html = '<li style="text-align:left;margin: 10%;font-size:16px" nodeid=' + nodeID + '>' + text + '</li>';
    return html;
}

function getJsonLength(json) {
    let length = 0;
    for (let key in json) length++;
    return length;
}

function filterAttributes(neighbours) {

    let attributes = []
    for (let id in neighbours) {
        if (!isEntity(id)) {
            //此时属于attribute
            for (let relation of neighbours[id].relations) {
                attributes.push({
                    relationID: relation.id,
                    nodeID: id,
                    type: relation.value,
                    value: instance_model.nodes[id].value
                })
            }
        }
    }
    return attributes;
}

function filterRelations(neighbours) {

    let relations = []
    for (let id in neighbours) {
        if (isEntity(id)) {
            //此时属于relation
            for (let relation of neighbours[id].relations) {
                relations.push({
                    relationID: relation.id,
                    nodeID: id,
                    type: relation.value,
                    value: instance_model.nodes[id].value
                })
            }
        }
    }
    return relations;
}

function getRoles(relation) {
    let type, value, roles = [];
    for (let role of relation.roles) {
        type = relation.type;
        if (role.rolename != "") type = role.rolename;
        value = instance_model.nodes[role.node_id].value;
        roles.push({type: type, value: value, id: role.node_id});
    }
    return roles;
}

/*
 function generateAttr(text) {
 var html = '<div class="panel-heading" style="text-align:left"><div class="panel-title stigmod-rcmd-title">' + text + '</div></div>';
 return html;
 }
 */

function generateFrontNodeID(val,type="e") {
    let n = getJsonLength(instance_model.nodes);
    if(val) n=val;
    let nodeID = "front_n" + type + n;

    while (instance_model.nodes[nodeID] != undefined) {
        n++;
        nodeID = "front_n" + type + n;
    }

    return nodeID;
}

var OperationCounter = 0;
function generateFrontOperationID() {

    OperationCounter = (OperationCounter+1)%100;
    //let id = localStorage.mongoMachineId + new Date().valueOf() + OperationCounter;
    let id = hash(user) + new Date().valueOf() + OperationCounter;
    return id;
}

var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');

function hash(input){
    var hash = 5381;
    var i = input.length - 1;

    if(typeof input == 'string'){
        for (; i > -1; i--)
            hash += (hash << 5) + input.charCodeAt(i);
    }
    else{
        for (; i > -1; i--)
            hash += (hash << 5) + input[i];
    }
    var value = hash & 0x7FFFFFFF;

    var retValue = '';
    do{
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while(value >>= 6);

    return retValue;
}

function generateFrontRelationID() {
    let n = getJsonLength(instance_model.relations);
    let relationID = "front_r" + n;

    while (instance_model.relations[relationID] != undefined) {
        n++;
        relationID = "front_r" + n;
    }

    return relationID;
}

function classReviseSubmit(item) {

    let type = $(item).find(".type-input").val();
    let value = $(item).find(".value-input").val();

    let err = isCreationIllegal("class",type,value)
    if(err != ""){
        alert(err)
        return;
    }

    let entity = {
        tags: [type],
        value: value,
        nodeId: generateFrontNodeID(value,"e"),
        valueId: generateFrontNodeID(value,"v"),
        relationId: generateFrontRelationID()
    }

    io_create_insModel_entity(entity);
    /*
    let nodes = {}
    nodes[generateFrontNodeID(value)] = {
        "tags":[type],
        "dataType": "姓名", //测试用
        "value": value
    }

    io_create_insModel_node(nodes)
    */
/*
    //生成Entity节点
    let entityNode = {};
    let entityNodeId = generateFrontNodeID(value,"e")
    entityNode[entityNodeId] = {
        "tags":[type],
        "value": ""
    }
    io_create_insModel_node(entityNode);
    //生成Value节点
    let valueNode = {};
    let valueNodeId = generateFrontNodeID(value,"v");
    valueNode[valueNodeId] = {
        "tags": ["String"], //默认
        "value": value
    }
    io_create_insModel_node(valueNode)
    //生成关系
    let relationId = generateFrontRelationID();
    let relations = {};
    relations[relationId] = {
        "type": "姓名",
        "roles": [
            {"rolename": "", "node_id": entityNodeId},
            {"rolename": "姓名", "node_id": valueNodeId}
        ]
    }
    io_create_insModel_relation(relations);
    return;
    */

}

function attributeReviseSubmit(item) {

    let type = $(item).find(".type-input").val();
    let value = $(item).find(".value-input").val();

    let err = isCreationIllegal("attribute",type,value);
    if(err != ""){
        alert(err);
        return;
    }

    //删除旧的节点和关系
    let origItem = $(".properties").find(".active");
    let origNode = $(origItem).find(".nodeID").attr("value");
    let origRelation = $(origItem).find(".relationID").attr("value");
    if (!(origRelation == "" || origRelation == undefined)) {   //好像肯定是有的，只是没有值而已
        io_remove_insModel_relation(origRelation);
    }
    if (!(origNode != "" || origRelation == undefined)) {
        io_remove_insModel_node(origNode);
    }
    //else{//则当前节点为中心节点
    //    io_remove_insModel_node($(".graph .center").attr("id"));
    //}

    //生成节点
    let nodes = {};
    let nodeId = generateFrontNodeID(value)
    nodes[nodeId] = {
        "dataType": type,
        "value": value
    }
    io_create_insModel_node(nodes)
    //生成关系
    let centerId = $(".graph .center").attr("id");
    let relationId = generateFrontRelationID();
    let relations = {};
    relations[relationId] = {
        "type": type,
        "roles": [
            {"rolename": "", "node_id": centerId},
            {"rolename": "", "node_id": nodeId}
        ]
    }
    io_create_insModel_relation(relations);
    return;
}

function attributeRemoveSubmit(item) {
    let centerID = $(".graph .center").attr("id");

    //删除旧的关系
    let origItem = $(".properties").find(".active");
    let origNode = $(origItem).find(".nodeID").attr("value");
    let origRelation = $(origItem).find(".relationID").attr("value");
    //console.log(origNode)
    //console.log(origRelation)
    if (!(origRelation == "" || origRelation == undefined)) {   //好像肯定是有的，只是没有值而已
        alert("remove relation!")
        io_remove_insModel_relation(origRelation);
    }
    if (!(origNode == "" || origNode == undefined)) {
        alert("remove node!")
        io_remove_insModel_node(origNode);
    }else{//则当前节点为中心节点
        alert("remove center node!")
        io_remove_insModel_node($(".graph .center").attr("id"));
    }
    //更新页面
    $("#" + centerID).click();  //这个在逻辑上有问题
    //transAnimation(centerID,null,null,instance_model);
}

function relationReviseSubmit(item) {

    let type = $(item).find(".type-input").val();
    let value = $(item).find(".value-input").val();

    let err = isCreationIllegal("relation",type,value);
    if(err != ""){
        alert(err);
        return;
    }

    //删除旧的节点和关系
    let origItem = $(".properties").find(".active");
    let origNode = $(origItem).find(".nodeID").attr("value");
    let origRelation = $(origItem).find(".relationID").attr("value");
    /* 好像是不需要产出实体的
    if (origNode != "") {
        io_remove_insModel_node(origNode);
    }else{//则当前节点为中心节点
        io_remove_insModel_node($(".graph .center").attr("id"));
    }
    */
    //console.log(origNode)
    //console.log(origRelation)
    if (!(origRelation == "" || origRelation == undefined)) {   //好像肯定是有的，只是没有值而已
        io_remove_insModel_relation(origRelation);
    }

    //判断关系两端的节点是否存在
    let nodeId = getEntityIdByValue(value, instance_model);
    if (nodeId == undefined) {
        alert("输入对象不存在");
        return;
    }

    //生成关系
    let centerId = $(".graph .center").attr("id");
    let relationId = generateFrontRelationID();
    let relations = {};
    relations[relationId] = {
        "type": type,
        "roles": [
            {"rolename": "", "node_id": centerId},
            {"rolename": "", "node_id": nodeId}
        ]
    }
    io_create_insModel_relation(relations);
    return;
}

function relationRemoveSubmit(item){
    let centerID = $(".graph .center").attr("id");

    //删除旧的关系
    let origItem = $(".properties").find(".active");
    let origNode = $(origItem).find(".nodeID").attr("value");
    let origRelation = $(origItem).find(".relationID").attr("value");
    /* 好像是不需要产出实体的
    if (origNode != "") {
        io_remove_insModel_node(origNode);
    }else{//则当前节点为中心节点
        io_remove_insModel_node($(".graph .center").attr("id"));
    }
    */
    if (!(origRelation == "" || origRelation == undefined)) {   //好像肯定是有的，只是没有值而已
        io_remove_insModel_relation(origRelation);
    }
    //更新页面
    $("#" + centerID).click();  //这个在逻辑上有问题
    //transAnimation(centerID,null,null,instance_model);
}

let clickTimeout = {
    _timeout: null,
    set: function (fn) {
        var that = this;
        that.clear();
        that._timeout = window.setTimeout(fn, 300);
    },
    clear: function () {
        var that = this;
        if (that._timeout) {
            window.clearTimeout(that._timeout);
        }
    }
};

function checkRecommendation(recommend_model, instance_model) {
    for (let relation in recommend_model.relations) {
        if (instance_model.relations[relation] != undefined) {
            delete recommend_model.relations[relation];
        }
    }
    return recommend_model;
}

function getAngle(N, RN, pRN, i) {

    if(N == 0) return 2 * Math.PI * i/RN;

    let gap = Math.floor(i / pRN) + 1;
    let angle;
    if (gap != N) {
        angle = 2 * Math.PI * (i + gap) / (N * (pRN + 1));
    }
    if (gap == N) { //最后一块进行平分
        let resti = i - (gap - 1) * pRN + 1;
        let restpRN = RN - Math.floor(RN/N)*N;
        angle = 2 * Math.PI * (gap - 1) / N + 2 * Math.PI * (resti) / (N * (restpRN + 1));
    }
    angle = 2 * Math.PI * (i + gap) / (N * (pRN + 1));  //test不错处理

    //console.log(i+" "+gap+" "+N+" "+ pRN +" "+angle);

    return angle;
}

function getStartAngle(entity1,entity2){
    let id1,id2;
    let i=0,j=0;
    let offset1,offset2;
    for(id1 in entity1.centerNode){}
    for(id2 in entity2.centerNode){}

    for(let tmp in entity1.neighbours){
        if(tmp == id2){
            offset1 = i;
        }
        i++;
    }
    for(let tmp in entity2.neighbours){
        if(tmp == id1){
            offset2 = j;
        }
        j++;
    }

    return [-(2 * Math.PI * offset1 / i),-(2 * Math.PI * offset2 / j)];

}

function shiftModel(recommend_model_whole,nodeID) {

    //console.log("recommend_model_whole");
    //console.log(recommend_model_whole);
    let tmpModel = {};
    for(let relation in recommend_model_whole.relations){
        for(let n in recommend_model_whole.relations[relation].roles){
            if(recommend_model_whole.relations[relation].roles[n]["node_id"] == nodeID){
                let id = recommend_model_whole.relations[relation].roles[1-n]["node_id"];
                if(instance_model.nodes[id]) break;
                tmpModel[id] = recommend_model_whole["nodes"][id]
                tmpModel[id].id = id;
                tmpModel[id].relations = [];
                tmpModel[id].relations.push({"id":relation,"value":recommend_model_whole.relations[relation].type});
                break;
            }
        }
    }
    return tmpModel;

}

function transAnimation(centerID,neighbourID,relationID,model) {
    //获取新增节点信息
    let entity = getEntity(centerID, model);
    if (entity == undefined) return false;  //如果不是实体的话

    let neighbours = getJsonLength(entity.neighbours);
    let relations = getJsonLength(entity.neighbours[neighbourID].relations);
    //如果是两个节点间形成多个关系，则直接重绘
    if(relations>1) {
        $("#" + centerID).click();
        return;
    }

    let n,tmpNodeID,tmpRelationID,tmpItem;
    let originPosition,rotateAngle;
    for(tmpNodeID in entity.neighbours){
        tmpItem = $("#"+tmpNodeID)
        let angle = 2 * Math.PI * getRank(tmpNodeID,entity) / neighbours + 0;
        cx = width/2 + R * Math.cos(angle);
        cy = height/2 + R * Math.sin(angle);
        $(tmpItem).transition({x:cx,y:cy});
        //旋转关系反转比较麻烦
        for(n in entity.neighbours[tmpNodeID].relations){//旋转关系
            tmpRelationID = entity.neighbours[tmpNodeID].relations[n].id;
            tmpItem = $("#"+tmpRelationID);
            originPosition = ""+width/2+"px "+height/2+"px";
            //rotateAngle = (360 * (getRank(tmpNodeID,entity) / neighbours - (getRank(tmpNodeID,entity)-1) / (neighbours-1)))%360;
            rotateAngle = (360 * (getRank(tmpNodeID,entity) / neighbours ))%360;
            $(tmpItem).transition({rotate: rotateAngle}).end(refreshText(entity));
            //$(tmpItem).next()
            //d3.select("#"+tmpRelationID).transition().style("rotate",rotateAngle).on( "start", function() {
            d3.select("[id='" + tmpRelationID+"']").transition().style("rotate",rotateAngle).on( "start", function() {
                mutex++;
            }).on( "end", function() {
                if( --mutex === 0 ) {
                    refreshText(entity);   //更新pathText
                }
            });
        }

    }

    //画出新增节点
    let tmpNode = {};
    tmpNode[neighbourID] = entity.neighbours[neighbourID];
    drawNeighbours(width / 2, height / 2, r, R, entity.neighbours,2 * Math.PI * (getRank(neighbourID,entity)+1) / neighbours);//不知道为什么要+1

    //将圆圈更新到前面
    svgBringToFront($("#"+centerID));

    //更新详细栏目信息
    if (entity) {
        //处理后面
        $(".properties-revise .button-left").click();
        $(property).children().remove();
        drawPropertyTitle();
        drawTypes(centerID);
        drawAttributes(centerID);
        drawRelations(centerID);
    }
    return true;
}


function getRank(id,entity){
    let i = 0;
    for(let key in entity.neighbours){
        if(key == id) break;
        i++;
    }
    return i;
}

function svgBringToFront(item) {
    var parent = $(item).parent();
    $(item).remove();
    $(parent).append(item);
}

function refreshText(entity){
    $(".textPath").remove();
    let paths = getPathTexts(width / 2, height / 2, R, r, 0, entity.neighbours);
    //console.log(paths);
    for (let path of paths) {
        drawPathText(path);
    }
}

let svgOperation = {
    clickNode : function(nodeId,model=instance_model){
        drawIndex();
        drawEntity(nodeId);
        $("#" + nodeId).click();
    }
}

let tagReformat = {
    value2id : function(msg) {
        //console.log("******value2id")
        //console.log("beforTrans"+msg)
        if(msg.nodes){
            //alert("nodes")
            for(let nodeId in msg.nodes){
                if(msg.nodes[nodeId].tags == undefined) msg.nodes[nodeId].tags = ["String"];
                let tmp = msg.nodes[nodeId].tags;
                for(let n in tmp){
                    //if(tmp[n]) alert(getValueId(tmp[n],model.nodes))
                    tmp[n] = getValueId(tmp[n],model.nodes);
                }
            }
        }
        if(msg.relations){
            //alert(relations)
            for(let relationId in msg.relations){
                let tmp = msg.relations[relationId].type; //前后不统一
                msg.relations[relationId].type = getValueId(tmp,model.relations);
            }
        }
        //console.log("afterTrans"+msg);
        //console.log("value2id******")
    },
    id2value : function(msg) {
        if(msg.nodes){
            for(let nodeId in msg.nodes){

                let tmp = msg.nodes[nodeId].tags;
                //临时处理recommend没有tags的问题 - 开始
                if(tmp == undefined){
                    if(msg.nodes[nodeId]["value"] == "") {
                        msg.nodes[nodeId].tags = ["人"]
                    }else{
                        msg.nodes[nodeId].tags = ["String"]
                    }
                    continue;
                }
                ////临时处理recommend没有tags的问题 - 结束
                for(let n in tmp){
                    tmp[n] = model.nodes[tmp[n]].value
                }
            }
        }
        if(msg.relations){
            for(let relationId in msg.relations){
                //alert(msg.relations[relationId].type)//创建操作，因为数据都是前台的所以都是给的type
                //alert(msg.relations[relationId].tag)//get操作，因为数据是前台的所以是tag
                let tmp = msg.relations[relationId].tag;    //前台获得情况
                if(tmp == undefined) tmp = msg.relations[relationId].type;   //获取本地的情况
                msg.relations[relationId].type = model.relations[tmp].value;

                //临时处理recommend没有tags的问题 - 开始
                let roles = msg.relations[relationId].roles;

                if(roles[0]["node_id"] == undefined){
                    msg.relations[relationId].roles = [
                        {rolename:"",node_id:roles[0]},
                        {rolename:"",node_id:roles[1]}
                    ]
                }
                ////临时处理recommend没有tags的问题 - 结束
            }
        }
    }
}

getValueId = function(value,item){
    for(let key in item){
        if(item[key]["value"] == value) return key;
    }
}

function prepareNewEntity(model=instance_model,refreshSvg = true){

    let hasCenterNode = false, centerNode;

    for(let rId in model["relations"]){
        let r = model["relations"][rId];
        if(r.type != "姓名") continue;

        let nId1,nId2,tmpNode;
        nId1 = r.roles[0].node_id;
        nId2 = r.roles[1].node_id;

        //如果是推荐，好像就会出现id不存在的情况

        let tags1 = model["nodes"][nId1]["tags"];
        let tags2 = model["nodes"][nId2]["tags"];

        if(tags1 != undefined){
            if(symbolArray.indexOf(tags1[0]) == -1){   //说明是Entity节点
                model["nodes"][nId1]["value"] = model["nodes"][nId2]["value"];
                delete model["nodes"][nId2];
                tmpNode = nId1;
            }else{
                model["nodes"][nId2]["value"] = model["nodes"][nId1]["value"];
                delete model["nodes"][nId1];
                tmpNode = nId2;
            }
        }else{
            if(symbolArray.indexOf(tags2[0]) == -1){   //说明是Entity节点
                model["nodes"][nId2]["value"] = model["nodes"][nId1]["value"];
                delete model["nodes"][nId1];
                tmpNode = nId2;
            }else{
                model["nodes"][nId1]["value"] = model["nodes"][nId2]["value"];
                delete model["nodes"][nId2];
                tmpNode = nId1;
            }
        }
        delete model["relations"][rId];
        if(!hasCenterNode) {
            hasCenterNode = true;
            centerNode = tmpNode;
        }
    }
    if(hasCenterNode && refreshSvg){
        drawIndex();
        drawEntity(centerNode);
        $("#" + centerNode).click();
        return true;
    }
    return false;
}

function getRelations(id1,id2,model=instance_model){
    let relation,roles,relationArray=[];
    for(relation in model["relations"]){
        roles = model["relations"][relation]["roles"];
        if(roles[0].node_id == id1){
            if(roles[1].node_id == id2)  relationArray.push(relation);
        }
        else if(roles[1].node_id == id1){
            if(roles[0].node_id == id2)  relationArray.push(relation);
        }
    }

    return relationArray;
}

function isCreationIllegal(type,tag,value){
    let hasError;
    let err="";
    switch (type){
        case "class":
            hasError = true;
            for(let key in model.nodes){
                if(model.nodes[key].value == tag) hasError = false;
            }
            if(tag == "String") hasError = true;
            if(hasError) err += "创建类型不合法\n";

            hasError = false;
            for(let key in instance_model.nodes){
                if(isEntity(key) && instance_model.nodes[key].value == value) {hasError = true;break;}
            }
            if(hasError) err +="创建实体已存在\n";
            break;
        case "attribute":
            hasError = true;
            for(let key in model.relations){
                if(model.relations[key].value == tag){
                    let roles = model.relations[key].roles;
                    for(let n in roles){
                        if(model.nodes[roles[n].node_id].tag == "Symbol"){
                            hasError = false;
                            break;
                        }
                    }
                }
            }
            if(hasError) err += "创建类型不合法\n";

            hasError = false;
            for(let key in instance_model.relations){
                if(instance_model.relations[key].type == tag) {
                    let centerId = $("g.center").attr("id");
                    let roles = instance_model.relations[key].roles;
                    for(let n in roles){
                        if(roles[n].node_id == centerId){
                            hasError = true
                            break;
                        }
                    }
                    if(hasError) break;
                }
            }
            if(hasError) err += "创建属性已存在\n";
            break;
        case "relation":
            let entityId;

            hasError = true;
            for(let key in model.relations){
                if(model.relations[key].value == tag){
                    hasError = false;
                    let roles = model.relations[key].roles;
                    for(let n in roles){
                        if(model.nodes[roles[n].node_id].tag == "Symbol"){
                            hasError = true;
                            break;
                        }
                    }
                    if(!hasError) break;
                }
            }
            if(hasError) err += "创建类型不合法\n";


            hasError = true;
            for(let key in instance_model.nodes){
                if(isEntity(key) && instance_model.nodes[key].value == value) {entityId = key;hasError = false;break;}
            }
            if(hasError) err +="实体尚未建立\n";
            if(hasError!="") break;

            hasError = false;
            let centerId = $("g.center").attr("id");
            for(let key in instance_model.relations){
                let roles = instance_model.relations[key].roles;
                for(let n in roles){
                    if((roles[n].node_id == entityId)&&(roles[1-n].node_id == centerId)){
                        hasError = true
                        break;
                    }
                }
                if(hasError) break;
            }
            if(hasError) err += "创建关系已存在\n";
            break;
    }
    return err;
}