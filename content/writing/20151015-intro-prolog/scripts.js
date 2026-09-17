PAUSE = 500;//200;
ANIMATION = 1200;//400;

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

  var links = $(".content a[href^='javascript']");
  $(links[0]).addClass("next");

  $(links).click(function(){
    var _this = $(this);
    links.removeClass("next")
    for(var i = 0; i < links.length; i++) {
      if (links[i] == this) {
        pause(function(){
          pause(function(){
            $(links[i+1]).addClass("next");
          });
        });
        return;
      }
    }
  });
});

var animating = false;

function highlight(obj, callback) {
  if (animating) return;

  animating = true;
  original_color = obj.style("stroke");
  original_width = obj.style("stroke-width");

  duration = ANIMATION;

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

function pause(callback) {
  if (callback) { window.setTimeout(callback, PAUSE); }
}

function append(target, source) {
  for(var i = 0; i < source[0].length; i++){
    target[0].push(source[0][i]);
  }
}

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

$(function(){
  // G1 setup
  g1 = d3.select("#g1 svg");
  g1_goal = g1.selectAll("#shapePath1");
  g1_call = g1.selectAll("#shapePath11, #shapePath4");
  g1_exit = g1.selectAll("#shapePath12, #shapePath2");
  g1_redo = g1.selectAll("#shapePath13, #shapePath3");
  g1_fail = g1.selectAll("#shapePath14, #shapePath5");

  // G2 setup
  g2 = d3.select("#g2 svg");
  g2_goal = g2.selectAll("#shapePath1");
  g2_call = g2.selectAll("#shapePath10, #shapePath4, #shapePath18, #markerPath18");
  g2_result = toText(g2.select("#Shape20")).text("");
  g2_index = toText(g2.select("#Shape15")).text("?");
  g2_exit = g2.selectAll("#shapePath11, #shapePath2");
  g2_redo = g2.selectAll("#shapePath12, #shapePath3");
  g2_fail = g2.selectAll("#shapePath13, #shapePath5");
  g2_init_exit = g2.selectAll("#shapePath21, #shapePath23, #markerPath23");
  append(g2_init_exit, g2_exit);
  g2_redo_next = g2.selectAll("#shapePath19, #markerPath19");
  append(g2_redo_next, g2_redo);
  g2_next_exit = g2.selectAll("#shapePath22, #shapePath23, #markerPath23");
  append(g2_next_exit, g2_exit);
  g2_next_fail = g2.selectAll("#shapePath24, #shapePath26, #markerPath26");
  append(g2_next_fail, g2_fail);

  c2 = $("#g2");
  c2_consult_enter = $(".l5 .n", c2).invisible();
  c2_result1 = $(".l6", c2).invisible();
  c2_result1_enter = $(".l6 .n", c2).invisible();
  c2_result2 = $(".l7", c2).invisible();
  c2_result2_enter = $(".l7 .n", c2).invisible();
  c2_fail = $(".l8", c2).invisible();

  // G3 setup
  g3 = d3.select("#g3 svg");
  c3 = $("#g3");

  g3_call = g3.selectAll("#shapePath4, #shapePath6");
  g3_b1_cursor = toText(g3.select("#Shape17")).text("?");
  g3_b2_cursor = toText(g3.select("#Shape18")).text("?");
  g3_a = toText(g3.select("#Shape19")).text("A = ???");
  g3_i = toText(g3.select("#Shape20")).text("I = ???");
  g3_b = toText(g3.select("#Shape21")).text("B = ???");
  g3_next_call = g3.selectAll("#shapePath2, #shapePath7");
  g3_exit = g3.selectAll("#shapePath11, #shapePath13");
  g3_fail = g3.selectAll("#shapePath5, #shapePath9");
  g3_redo = g3.selectAll("#shapePath12, #shapePath14");
  g3_redo_exit = g3.selectAll("#shapePath3, #shapePath8");
  $("div:nth-child(2) code", c3).invisible();

  // G4 setup
  g4 = d3.select("#g4 svg");
  g4_l1 = g4.selectAll("#Layer1");
  g4_l2 = g4.selectAll("#Layer2").style("opacity", 0);
  g4_l3 = g4.selectAll("#Layer3").style("opacity", 0);
  g4_l4 = g4.selectAll("#Layer4").style("opacity", 0);
  c4 = $("#g4");  
});


// G2 functions

function setCursor(selector, context) {
  $("*", context).removeClass("cursor");
  $(selector, context).addClass("cursor");
}

function setG2CursorState(line) {
  g2_index.text(line);
  setCursor(".l" + line, c2);
}

function g2s1(callback) {
  highlight(g2_call, function(){
    setG2CursorState("1");
    highlight(g2_index, function(){
      highlight(g2_init_exit, function(){
        g2_result.text("X = juan");
        c2_result1.visible();
        pause(callback);
      });
    });
  });
}

function g2s2(callback) {
  c2_result1_enter.visible();
  pause(function(){
    g2_result.text("");
    highlight(g2_redo_next, function(){
      highlight(g2_index, function(){
        setG2CursorState("2");
        pause(function(){
          setG2CursorState("3");
          pause(function(){
            setG2CursorState("4");
            pause(callback)
          });
        });
      });
    });
  });
}

function g2s3(callback) {
  highlight(g2_next_exit, function(){
    g2_result.text("X = pedro");
    c2_result2.visible();
    pause(callback);
  });
}

function g2s4() {
  c2_result2_enter.visible();
  pause(function(){
    g2_result.text("");
    highlight(g2_redo_next, function(){
      highlight(g2_index, function(){
        g2_index.text("?");
        setCursor(".none", c2);

        pause(function(){
          highlight(g2_next_fail, function(){
            c2_fail.visible();
          });
        });
      });
    });
  });
}

// G3 functions

function setG3C1(number) {
  $("*", c3).removeClass("c1");
  g3_b1_cursor.text(number);
  if (number != "?")
    $(".l" + number, c3).addClass("c1");
}

function setG3C2(number) {
  $("*", c3).removeClass("c2");
  g3_b2_cursor.text(number);
  if (number != "?")
    $(".l" + number, c3).addClass("c2");
}

function g3s1(callback) {
  highlight(g3_call, function(){
    highlight(g3_b1_cursor, function(){
      setG3C1("1");
      pause(callback);
    });
  });
}

function g3s2(callback) {
  g3_a.text("A = juan");
  g3_i.text("I = ruso");
  pause(function(){
    highlight(g3_next_call, function(){
      highlight(g3_b2_cursor, function(){
        setG3C2("1");
        pause(function(){
          g3_b.text("B = juan");
          pause(function(){
            highlight(g3_exit, function(){
              $(".l6", c3).visible();
              pause(callback);
            });
          });
        });
      });
    });
  });
}

function g3s3(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("2");
      pause(function(){
        setG3C2("3");
        pause(function(){
          setG3C2("4");
          pause(function(){
            g3_b.text("B = pedro");
            pause(function(){
              highlight(g3_exit, function(){
                $(".l7", c3).visible();
                pause(callback);
              })
            });
          });
        });
      });
    });
  });
}

function g3s4(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("?");
      pause(function(){
        highlight(g3_redo_exit, function(){
          g3_a.text("A = ???");
          g3_i.text("I = ???");
          highlight(g3_b1_cursor, function() {
            setG3C1("2");
            pause(function(){
              g3_a.text("A = juan");
              g3_i.text("I = inglés");
              highlight(g3_next_call, callback);
            });
          });
        });
      });
    });
  });
}

function g3s5(callback) {
  highlight(g3_b2_cursor, function(){
    setG3C2("1");
    pause(function(){
      setG3C2("2");
      pause(function(){
        g3_b.text("B = juan");
        pause(function(){
          highlight(g3_exit, function(){
            $(".l8", c3).visible();
            pause(callback);
          });
        });
      });
    });
  });
}

function g3s6(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("3");
      pause(function(){
        g3_b.text("B = maría");
        pause(function(){
          highlight(g3_exit, function(){
            $(".l9", c3).visible();
            pause(callback);
          });
        });
      });
    });
  });
}

function g3s7(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("4");
      pause(function(){
        setG3C2("?");
        pause(function(){
          highlight(g3_redo_exit, function(){
            g3_a.text("A = ???");
            g3_i.text("I = ???");
            highlight(g3_b1_cursor, function() {
              setG3C1("3");
              pause(function(){
                g3_a.text("A = maría");
                g3_i.text("I = inglés");
                highlight(g3_next_call, callback);
              });
            });
          });
        });
      });
    });
  });
}

function g3s8(callback) {
  highlight(g3_b2_cursor, function(){
    setG3C2("1");
    pause(function(){
      setG3C2("2");
      pause(function(){
        g3_b.text("B = juan");
        pause(function(){
          highlight(g3_exit, function(){
            $(".l10", c3).visible();
            pause(callback);
          });
        });
      });
    });
  });
}

function g3s9(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("3");
      pause(function(){
        g3_b.text("B = maría");
        pause(function(){
          highlight(g3_exit, function(){
            $(".l11", c3).visible();
            pause(callback);
          });
        });
      });
    });
  });
}

function g3s10(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("4");
      pause(function(){
        setG3C2("?");
        pause(function(){
          highlight(g3_redo_exit, function(){
            g3_a.text("A = ???");
            g3_i.text("I = ???");
            highlight(g3_b1_cursor, function() {
              setG3C1("4");
              pause(function(){
                g3_a.text("A = pedro");
                g3_i.text("I = ruso");
                highlight(g3_next_call, callback);
              });
            })
          });
        });
      });
    });
  });
}

function g3s11(callback) {
  highlight(g3_b2_cursor, function(){
    setG3C2("1");
    pause(function(){
      g3_b.text("B = juan");
      pause(function(){
        highlight(g3_exit, function(){
          $(".l12", c3).visible();
          pause(callback);
        });
      });
    });
  });
}

function g3s12(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("2");
      pause(function(){
        setG3C2("3");
        pause(function(){
          setG3C2("4");
          pause(function(){
            g3_b.text("B = pedro");
            pause(function(){
              highlight(g3_exit, function(){
                $(".l13", c3).visible();
                pause(callback);
              })
            });
          });
        });
      });
    });
  });
}

function g3s13(callback) {
  highlight(g3_redo, function(){
    g3_b.text("B = ???");
    highlight(g3_b2_cursor, function() {
      setG3C2("?");
      pause(function(){
        highlight(g3_redo_exit, function(){
          g3_a.text("A = ???");
          g3_i.text("I = ???");
          highlight(g3_b1_cursor, function() {
            setG3C1("?");
            pause(function(){
              highlight(g3_fail, callback);
            });
          })
        });
      });
    });
  });
}

function g3g(i) {
  switch (i) {
    case 1:g3s1(g3s2);break;
    case 2:g3s3();break;
    case 3:g3s4(g3s5);break;
    case 4:g3s6();break;
    case 5:g3s7(g3s8);break;
    case 6:g3s9();break;
    case 7:g3s10(g3s11);break;
    case 8:g3s12(g3s13);break;
  }
}

function g3total() {
  g3s1(function(){
    g3s2(function(){
      g3s3(function(){
        g3s4(function(){
          g3s5(function(){
            g3s6(function(){
              g3s7(function(){
                g3s8(function(){
                  g3s9(function(){
                    g3s10(function(){
                      g3s11(function(){
                        g3s12(g3s13)
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  })
}

// G4 functions

function uncover(obj, callback) {
  obj.transition()
    .duration(ANIMATION).style("opacity", 1)
    .each("end", function(){
      if (callback) { callback(); }
    });
}

function cover(obj, callback) {
  obj.transition()
    .duration(ANIMATION).style("opacity", 0)
    .each("end", function(){
      if (callback) { callback(); }
    });
}

function g4s1(callback) {
  setCursor(".l7", c4);
  pause(function(){
    uncover(g4_l2, function(){
      pause(callback);
    });
  });
}

function g4s2(callback) {
  cover(g4_l2, function(){
    setCursor(".l8", c4);
    pause(function(){
      uncover(g4_l3, function(){
        pause(callback);
      });
    });
  });
}

function g4s3(callback) {
  setCursor(".l5", c4);
  pause(function(){
    uncover(g4_l4, function(){
      pause(callback);
    });
  });
}

// g4s1(function(){ g4s2(g4s3); });

// tree

var treeData = [
  {
    "name": "seComunican(maría, A)",
    "resolutionName": "¬ seComunican(maría, A)",
    "parent": "null",
    "children": [
      {
        "name": "telepatía(maría, A)",
        "resolutionName": "¬ telepatía(maría, A)",
        "rule": "seComunican(A₁, B₁) :- telepatía(A₁, B₁).",
        "resolutionRule": "seComunican(A₁, B₁), ¬ telepatía(A₁, B₁)",
        "unification": "A₁ ← maría, B₁ ← A",
        "children": [
          {
            "name": "⟂ con A = pedro",
            "kind": "success",
            "rule": "telepatía(maría, pedro).",
            "resolutionRule": "telepatía(maría, pedro)",
            "unification": "A ← pedro",
          }
        ]
      },
      {
        "name": "hablaCon(maría, A)",
        "resolutionName": "¬ hablaCon(maría, A)",
        "rule": "seComunican(A₂, B₂) :- hablaCon(A₂, B₂).",
        "resolutionRule": "seComunican(A₂, B₂), ¬ hablaCon(A₂, B₂)",
        "unification": "A₂ ← maría, B₂ ← A",
        "children": [
          {
            "name": "habla(maría, I₃), habla(A, I₃), maría \\= A",
            "resolutionName": "¬ habla(maría, I₃), ¬ habla(A, I₃), ¬ maría \\= A\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u200B",
            "rule": "hablaCon(A₃, B₃) :- habla(A₃, I₃), habla(B₃, I₃), A₃ \\= B₃.",
            "resolutionRule": "hablaCon(A₃, B₃), ¬ habla(A₃, I₃), ¬ habla(B₃, I₃), ¬ A₃ \\= B₃",
            "unification": "A₃ ← maría, B₃ ← A",
            "children": [
              {
                "name": "habla(A, inglés), maría \\= A",
                "resolutionName": "¬ habla(A, inglés), ¬ maría \\= A",
                "rule": "habla(maría, inglés).",
                "resolutionRule": "habla(maría, inglés)",
                "unification": "I₃ ← inglés",
                "children": [
                  {
                    "name": "maría \\= juan",
                    "resolutionName": "¬ maría \\= juan",
                    "rule": "habla(juan, inglés).",
                    "resolutionRule": "habla(juan, inglés)",
                    "unification": "A ← juan",
                    "children": [
                      {
                        "name": "⟂ con A = juan",
                        "kind": "success",
                        "rule": "\\=",
                        "unification": "verdadero"
                      }
                    ]
                  },
                  {
                    "name": "maría \\= maría",
                    "resolutionName": "¬ maría \\= maría",
                    "rule": "habla(maría, inglés).",
                    "resolutionRule": "habla(maría, inglés)",
                    "unification": "A ← maría",
                    "children": [
                      {
                        "name": "falla",
                        "kind": "fail",
                        "rule": "\\=",
                        "unification": "falso"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// ************** Generate the tree diagram	 *****************
var margin = {top: 40, right: 80, bottom: 20, left: 80},
	width = 600 - margin.right - margin.left,
	height = 570 - margin.top - margin.bottom;

var resolutionSpineX = 390;
var resSeparation = 107;

var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var showingAll = true;

var diagonal = d3.svg.diagonal()
	.projection(function(d) {
    return [d.x, d.y];
  });

var diagonalBranch = d3.svg.diagonal()
	.projection(function(d) {
    return [resolutionSpineX, d.y];
  });

$(function(){
  var svg = d3.select("#tree")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = treeData[0];

  update(root);

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
    var link;

    var selectedLink;
    var resLink;
    var resNodes;

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Declare the nodes…
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

    showingResolution = false;
    var nodeText = function(d) { return showingResolution ? d.resolutionName || d.name : d.name; };
    var nodeResText = function(d) { return showingResolution ? d.target.resolutionRule || d.target.rule : d.target.rule; };

    var showBranchOnly = function(d) {
      svg.selectAll(".node").classed("hide", true).classed("keep", false);

      var current = d;
      var branchLinks = [];
      while (current != null) {
        if (current.parent != null && current.parent.parent != null) {
          branchLinks.push({source: current.parent, target: current});
        }
        svg.selectAll(".node-" + current.id)
          .classed("keep", true)
          .classed("hide", false);
        current = current.parent;
      }

      // Declare the links…
      selectedLink = svg.selectAll("path.linkBranch")
        .data(branchLinks, function(d) { return d.target.id; });

      // Enter the links.
      selectedLink.enter().insert("path", "g")
        .attr("class", "linkBranch")
        .attr("d", diagonal);

      link.transition().duration(ANIMATION/2).style("opacity",0);

      svg.selectAll(".node.hide").transition().duration(ANIMATION/2)
        .style("opacity",0).each("end", function(){

          selectedLink.transition().duration(ANIMATION/2).attr("d", diagonalBranch);

          svg.selectAll(".node.keep").transition().duration(ANIMATION/2)
            .attr("transform", function(d) {
              return "translate(" + resolutionSpineX + "," + d.y + ")";
            }).each("end", function(){
              var resVSep = 25;

              svg.selectAll("path.linkRes")
                .data(branchLinks)
                .enter()
                  .insert("path", "g")
                  .attr("class", "linkRes")
                  .attr("d", function(d){ return diagonal({
                    source: {x: resolutionSpineX - resSeparation, y: d.source.y + resVSep},
                    target: {x: resolutionSpineX, y: d.target.y}
                  })})
                  .style("opacity",0)
                  .transition().duration(ANIMATION/2).style("opacity",1);

              resNodes = svg.selectAll("g.res").data(branchLinks);

              var resEnter = resNodes
                .enter().append("g")
                .attr("class", "res")
                .attr("transform", function(d) {
                  return "translate(" + (resolutionSpineX-resSeparation) + "," + (d.source.y+resVSep) + ")"; })

              resEnter.style("opacity",0);

              resEnter.append("circle")
                .attr("r", 5)
                .style("fill", "#fff");

              resText = resEnter.append("text")
                .attr("x", -12)
                .attr("y", -22)
                .attr("dy", ".35em")
                .attr("text-anchor", "end");

              resText.append("tspan")
                .attr("class", "rule")
                .text(nodeResText)
                .style("fill-opacity", 1);

              resText.append("tspan")
                .attr('x', -12)
                .attr('dy', 22)
                .text(function(d) { return d.target.unification; })
                .style("fill-opacity", 1);

              resEnter.transition().duration(ANIMATION/2).style("opacity",1);

            });
        });

    };

    var showAll = function() {
      resNodes = null;

      resLink = svg.selectAll("path.linkRes, g.res");

      function showNodes() {
        svg.selectAll(".node.keep").transition().duration(ANIMATION/2)
          .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          }).each("end", function(){

            svg.selectAll(".node.hide").transition().duration(ANIMATION/2)
              .style("opacity",1);

            link.transition().duration(ANIMATION/2)
              .style("opacity",1).each("end", function(){
                selectedLink.remove();
              });

            svg.selectAll(".node").classed("hide", false).classed("keep", false);

          });
      }

      if (resLink.empty()) {
        showNodes();
      } else {
        resLink.transition().duration(ANIMATION/2)
          .style("opacity",0).each("end", function(){

            resLink.remove();

            selectedLink.transition().duration(ANIMATION/2).attr("d", diagonal);

            showNodes();
          });
      }
    };

    window.toggleResolution = function() {
      showingResolution = !showingResolution;
      node.select("text").text(nodeText);
      resNodes.select("text tspan.rule").text(nodeResText);
    }

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("class", function(d) { return "node node-" + d.id + " " + d.kind; })
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", function(d) {
        showingAll = !showingAll;
        if (!showingAll)
          showBranchOnly(d);
        else
          showAll(d);
      });

    nodeEnter.append("circle")
      .attr("r", 10)
      .style("fill", "#fff");


    nodeEnter.append("text")
      .attr("y", function(d) {
        return d.children || d._children ? -22 : 22; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(nodeText)
      .style("fill-opacity", 1)

    // Declare the links…
    link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal);
  }
});
