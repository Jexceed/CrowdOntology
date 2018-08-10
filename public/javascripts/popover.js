/**
 * Created by ChiangEarl on 18/7/26.
 */

//使得提示工具Popover生效
$('#stigmod-add-left-btn[data-popover="popover"]').popover({
    "animation": true,
    "title": "新建",
    "trigger": "focus",
    "placement": "bottom",
    "container": 'body',
    "html": true,
    "content": '<div class="btn-group"><button class="btn btn-primary add-class">实体</button><button class="btn btn-success add-relation">关系</button></div>'
    // "content":'<div class="btn-group" data-toggle="buttons"><label class="btn btn-primary active"> <input type="checkbox" autocomplete="off" checked>实体</label><label class="btn btn-primary"><input type="checkbox" autocomplete="off">关系</label></div>'
})


$('[data-popover="popover"]').popover()


$(document).on("mouseover", '.showPopover li', function () {

    let nodeId = data.getEntityIdByValue($(this).text());
    let content = generatePoperContent(nodeId);

    $(this).popover({
        "animation": true,
        "title": "详情",
        "trigger": "hover",
        "placement": "left",
        "container": 'body',
        "html": true,
        "content": content
    })

    $(this).popover("show")
})

$(document).on("mouseover", '.entity.isRecommendation', function () {

    let id = $(this).attr('id');
    id = id.split("-")["0"];
    let content = generatePoperContent(id,recommend_model);

    $(this).popover({
        "animation": true,
        "title": "详情",
        "trigger": "hover",
        "placement": "left",
        "container": 'body',
        "html": true,
        "content": content
    })

    $(this).popover("show")
})

$(document).on("mouseover", '.rcmdMask', function () {
    $(this).popover({
        "animation": true,
        "title": "推荐信息",
        "trigger": "hover",
        "placement": "left",
        "container": 'body',
        "html": true,
        "content": '<p>(双击元素后，添加至当前图谱)</p>'
    })

    $(this).popover("show")
})

$(function () {
    $(document).on("click", '.popover-content .add-class', function () {
        detail.classRevise(this, "add");
    })
    $(document).on("click", '.popover-content .add-relation', function () {
        detail.relationRevise(this, "add");
    })
});

generatePoperContent = function (id,tmpModel=instance_model) {
    let content = "";
    //drawTypes
    content += generatePoperLine("实体 : " + tmpModel.nodes[id].tags[0])
    //drawAttributes
    content += generatePoperLine(tmpModel.nodes[id].dataType + " : " + tmpModel.nodes[id].value)//主属性

    entity = data.getEntity(id,tmpModel);
    let attributes = filterAttributes(entity.neighbours,tmpModel);

    attributes.forEach(function (attribute,index,array) {//其他属性
        content += generatePoperLine(attribute.type + " : " + attribute.value)
    })

    //drawRelations
    entity = svg.getEntity(id,tmpModel);
    let relations = detail.filterRelations(entity.relations,id,tmpModel);
    let relationArray = [];
    for (let i in relations) {
        let relation = relations[i];
        if (relationArray.indexOf(relation.relationId) == -1) {
            relationArray.push(relation.relationId);
            content += generatePoperLine(relation.type + " : " + relation.value);
        }
    }

    return content;
}

generatePoperLine = function (text) {
    return '<p>' + text + '</p>';
}

popoverHide = function(){
    $('.rcmdMask').popover("hide");
    $('.entity.isRecommendation').popover("hide");
}

$(document).on("click", '.popover', function () {
    $(this).hide();
})
