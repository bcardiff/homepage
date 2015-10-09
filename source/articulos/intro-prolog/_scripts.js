function toText(elem) {
  var bbox = elem.select("path")[0][0].getBBox();
  elem.selectAll("*").remove();
  return elem.append("text").text("X = ???").attr("x", bbox.x).attr("y", bbox.y + bbox.height);
}

$(function(){

  $("a[href^='#ref']").each(function(){
    $(this).attr('href', "javascript:highlight(" + $(this).attr('href').substring(5) + ")")
  });

  // $("a[href^='javascript:highlight']").mouseenter(function(){
  //   eval($(this).attr('href'));
  // });
});

var animating = false;

function highlight(obj, callback) {
  if (animating) return;

  animating = true;
  original_color = obj.style("stroke");
  original_width = obj.style("stroke-width");

  duration = 1200;

  highlight_color = "#E88D3E";
  highlight_width = 4;
  obj.transition()
    .duration(duration / 4).style("stroke", highlight_color).style("stroke-width", highlight_width)
    .each("end", function(){
      obj.transition()
        .duration(duration / 4).style("stroke", original_color)
        .each("end", function(){
          obj.transition()
            .duration(duration / 4).style("stroke", highlight_color)
            .each("end", function(){
              obj.transition()
                .duration(duration / 4).style("stroke", original_color).style("stroke-width", original_width)
                .each("end", function(){
                  animating = false;
                  if (callback) { callback(); }
                });
            });
        });
    });
}
