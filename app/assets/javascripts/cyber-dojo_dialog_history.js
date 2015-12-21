/*global $,cyberDojo*/

var cyberDojo = (function(cd, $) {
  "use strict";

  // Arguably, the history would be better as it own page rather
  // than a dialog. That would help google searchability and
  // analytics and useability and restfulness etc.
  // I use a dialog because of revert.
  // When revert is clicked it has to be for a *specific*
  // animal and it has to revert their code! As a dialog,
  // the revert has access to animal's code on the page
  // from which the history-dialog opened.
  // An alternative would be to do a post for the animal
  // and then get the server to push a notification to the
  // animal or get the animl to poll an update from the server.
  // But I currently don't have any server -> browser
  // interaction and I'm not sure I want any.

  cd.td = function(html) {
	  return '<td>' + html + '</td>';
  };
                                            // eg
  cd.dialog_history = function(id,          // 'D936E1EB3F'
                               avatarName,  // 'lion'
                               wasTagParam, // 8   (1-based)
                               nowTagParam, // 9   (1-based)
                               showRevert   // true
                              ) {

    var currentFilename = '';
    var data = {
      wasTag: wasTagParam,
      nowTag: nowTagParam
    };
    var wasTag = function() {
      return data.wasTag;
    };
    var nowTag = function() {
      return data.nowTag;
    };
    var inDiffMode = function() {
      return wasTag() != nowTag();
    }
    var titleBar = function() {
      return $('#ui-dialog-title-history-dialog');
    };
    var td = function(align, html) {
      return '<td align="' + align + '">' + html + '</td>';
    };


    //-------------------------------------------------------
    // titlebar: diff? [x] traffic-lights
    //-------------------------------------------------------

    var makeTitleHtml = function() {
      return '<table>' +
               '<tr valign="top">' +
                 cd.td(makeDiffTitleHtml()) +
                 cd.td(makeDiffCheckboxHtml()) +
                 cd.td('<div id="traffic-lights"></div>') +
               '</tr>' +
             '</table>';
    };

    //---------------------------------------------------
    // diff? [x]
    //---------------------------------------------------

    var makeDiffTitleHtml = function() {
      return '<div id="title">diff?</div>';
    };

    var makeDiffCheckboxHtml = function() {
      return '<input type="checkbox"' +
                   ' class="regular-checkbox"' +
                   ' id="diff-checkbox"' +
                   ' checked="' + (inDiffMode() ? "checked" : "") + '"/>' +
              '<label for="diff-checkbox"></label>';
    };

    //- - - - - - - - - - - - - - -

    var diffCheckBox = function() {
      return $('#diff-checkbox', titleBar());
    };

    //- - - - - - - - - - - - - - -
    // refresh diff? [x]
    //- - - - - - - - - - - - - - -

    var refreshDiffCheckBox = function() {
      diffCheckBox()
        .html(makeDiffCheckboxHtml())
        .attr('checked', inDiffMode())
        .unbind('click')
        .bind('click', function() { show(nowTag()); });
    }

    //---------------------------------------------------
    // traffic-lights
    //---------------------------------------------------

    var makeTrafficLightsHtml = function(lights) {
      var html = '';
      var index = 1;
      $.each(lights, function(n, light) {
        var barGap = (nowTag() === light.number) ? 'bar' : 'gap';
        html +=
          "<div class='traffic-light'>" +
            "<img src='/images/bulb_" + light.colour + '_' + barGap + ".png'" +
                " data-index='" + index + "'" +
                " data-tag='" + light.number + "'/>" +
          "</div>";
          index += 1;
      });
      return html;
    };

    //- - - - - - - - - - - - - - -

    var trafficLights = function() {
      return $('#traffic-lights', titleBar());
    };

    //- - - - - - - - - - - - - - -
    // refresh traffic-lights
    //- - - - - - - - - - - - - - -

    var refreshTrafficLights = function() {
      trafficLights().html(makeTrafficLightsHtml(data.lights));
      $.each($('img[src$="_gap.png"]', titleBar()), function(_, light) {
        var index = $(this).data('index');
        var tag = $(this).data('tag');
        $(this)
          .attr('title', toolTip(index))
          .click(function() { show(tag); });
      });
    };

    //---------------------------------------------------
    // navigate control: < avatar >
    //---------------------------------------------------

    var makeAvatarNavigationTr = function() {
      return '<tr valign="top">' +
               td('right',  makeAvatarButtonHtml('prev')) +
               td('center', makeAvatarImageHtml()) +
               td('left',   makeAvatarButtonHtml('next')) +
             '</tr>';
    };

    //- - - - - - - - - - - - - - -

    var makeAvatarButtonHtml = function(direction) {
      return '<button class="triangle button" ' +
                        'id="' + direction + '-avatar">' +
                '<img src="/images/triangle_' + direction +'.gif"/>' +
             '</button>';
    };

    //- - - - - - - - - - - - - - -

    var makeAvatarImageHtml = function() {
      return '<img id="avatar"' +
                ' src="/images/avatars/' + avatarName + '.jpg"/>';
    };

    //- - - - - - - - - - - - - - -
    // refresh < avatar >
    //- - - - - - - - - - - - - - -

    var refreshAvatarImage = function() {
      $('#avatar').parent().html(makeAvatarImageHtml());
    };

    //- - - - - - - - - - - - - - -

    var refreshPrevAvatarHandler = function() {
      refreshAvatarHandler('prev', data.prevAvatar);
    };

    //- - - - - - - - - - - - - - -

    var refreshNextAvatarHandler = function() {
      refreshAvatarHandler('next', data.nextAvatar);
    };

    //- - - - - - - - - - - - - - -

    var refreshAvatarHandler = function(id,name) {
      var title = function() {
        var text = 'Click to review ' + name + "'s ";
        return text + (inDiffMode() ? 'history diff' : 'current code');
      };
      $('#' + id + '-avatar')
        .attr('disabled', name === '')
        .attr('title', title())
        .unbind('click')
        .bind('click', function() {
          avatarName = name;
          if (inDiffMode()) {
            show(1);
          } else {
            showNoDiff();
          }
        });
    };

    //---------------------------------------------------
    // navigate control: < tag  >
    //---------------------------------------------------

    var makeTagNavigationTr = function() {
      return '<tr valign="top">' +
               td('right',  makeTagButtonHtml('prev')) +
               td('center', makeNowTagNumberHtml()) +
               td('left',   makeTagButtonHtml('next')) +
             '</tr>';
    };

    //- - - - - - - - - - - - - - -

    var makeTagButtonHtml = function(name) {
      return '<button class="triangle button"' +
                       ' id="' + name + '-tag">' +
               '<img src="/images/triangle_' + name + '.gif"' +
                   ' alt="move to ' + name + ' diff"/>' +
             '</button>';
    };

    //- - - - - - - - - - - - - - -

    var makeNowTagNumberHtml = function() {
      return '<div id="now-tag-number"/></div>';
    };

    //- - - - - - - - - - - - - - -
    // refresh < tag  >
    //- - - - - - - - - - - - - - -

    var refreshTagControls = function() {
      var colour = data.lights[nowTag() - 1].colour;
      var minTag = 1;
      var maxTag = data.lights.length;
      var tagsToLeft = minTag < nowTag();
      var tagsToRight = nowTag() < maxTag;
      $('#now-tag-number')
        .removeClass()
        .addClass(colour)
        .html(nowTag());
      refreshTag(tagsToLeft,  $('#prev-tag'),  nowTag() - 1);
      refreshTag(tagsToRight, $('#next-tag'),  nowTag() + 1);
    };

    //- - - - - - - - - - - - - - -

    var refreshTag = function(on, button, newTag) {
      button
        .attr('disabled', !on)
        .css('cursor', on ? 'pointer' : 'default');
      if (on) {
        button
          .attr('title', toolTip(newTag))
          .unbind('click')
          .bind('click', function() { show(newTag); });
      }
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var show = function(tag) {
      data.wasTag = tag - (diffCheckBox().is(':checked') ? 1 : 0);
      data.nowTag = tag;
      refresh();
    };

    //- - - - - - - - - - - - - - -

    var showNoDiff = function() {
      var lastTag = -1;
      data.wasTag = lastTag;
      data.nowTag = lastTag;
      refresh();
    };

    //- - - - - - - - - - - - - - -

    var toolTip = function(tag) {
      if (inDiffMode()) {
        return 'Show diff->' + tag;
      } else {
        return 'Show ' + tag;
      }
    };

    //---------------------------------------------------
    // diff Div
    //---------------------------------------------------

    var makeDiffDiv = function()  {
      var div = $('<div>', {
        'id': 'history-dialog'
      });
      div.append(
        '<table>' +
          '<tr valign="top">' +
            '<td>' +
              '<table class="navigate-control">' +
                makeAvatarNavigationTr() +
                makeTagNavigationTr() +
              '</table>' +
              '<div id="diff-filenames"></div>' +
            '</td>' +
            '<td>' +
              '<div id="diff-content"></div>' +
            '</td>' +
          '</tr>' +
        '</table>'
      );
      return div;
    };

    //- - - - - - - - - - - - - - -

    var diffDiv = makeDiffDiv();

    //- - - - - - - - - - - - - - -

    var refreshDiff = function() {
      diffFilenames.html(makeDiffFilenames(data.diffs));
      resetFilenameAddedDeletedLineCountHandlers();
      diffContent.html(makeDiffContent(data.diffs));
      buildDiffFilenameHandlers(data.idsAndSectionCounts);
      var allTheWay = 100000;
      $('#diff-filenames').scrollLeft(allTheWay);
      showFile(data.currentFilenameId);
    };

    //- - - - - - - - - - - - - - -

    var showFile = function(filenameId) {
      var filename =  $('#radio_' + filenameId, diffDiv);
      filename.click();
      filename.scrollIntoView({ direction: 'vertical' });
    };

    //- - - - - - - - - - - - - - -

    var diffContent = $('#diff-content', diffDiv);

    //- - - - - - - - - - - - - - -

    var makeDiffContent = function(diffs) {
      var holder = $('<span>');
      $.each(diffs, function(_, diff) {
        var table = $('' +
          '<div id="' + diff.filename + '_diff_div" class="filename_div">' +
          '<table>' +
            '<tr class="valign-top">' +
              cd.td('<div class="diff-line-numbers"></div>') +
              cd.td('<div id="diff_file_content_for_' + diff.filename +
              '" class="diff-sheet">' +
                '</div>') +
            '</tr>' +
          '</table>' +
          '</div>'
          );
        var content = $('.diff-sheet', table);
        var numbers = $('.diff-line-numbers', table);
        content.html(diff.content);
        numbers.html(diff.line_numbers);
        cd.bindLineNumbersFromTo(content, numbers);
        holder.append(table);
      });
      return holder;
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var buildDiffFilenameHandlers = function(diffs) {

      // Builds the diff filename click handlers for a given
      // [ kata-id, animal-name, was-tag, now-tag] tuple.
      //
      // Clicking on the filename brings it into view by hiding the
      // previously selected file and showing the selected one.
      //
      // The first time a filename X with one or more diff-sections is
      // clicked it is opened and its first diff-section is auto
      // scrolled into view. If you open a different file and then reclick
      // filename X you will *not* get an autoscroll to the next diff.
      // This is so the scrollPos of a file is retained as you move
      // from one file to another, manually scrolling.
      //
      // However, if filename X is already open and you reclick
      // on filename X then you *will* get an autoscroll to the
      // *next* diff-section in that diff (which will cycle round).

      var previousFilenameNode;
      var alreadyOpened = [];

      var getFilename = function(node) {
        return $.trim(node.text());
      };

      var id = function(name) {
        return $('[id="' + name + '"]', diffDiv);
      };

      var diffFileContentFor = function(filename) {
        return id('diff_file_content_for_' + filename);
      };

      var diffFileDiv = function(filename) {
        return id(filename + '_diff_div');
      };

      var loadFrom = function(diff) {

        var id = diff.id;
        var filenameNode = $('#radio_' + id, diffDiv);
        var filename = getFilename(filenameNode);
        var sectionCount = diff.section_count;

        var diffSheet = diffFileContentFor(filename);
        var sectionIndex = 0;

        if (sectionCount > 0) {
          filenameNode.attr('title', 'Auto-scroll through diffs');
        }

        return function() {

          var reselected =
            previousFilenameNode !== undefined &&
            getFilename(previousFilenameNode) === filename;

          $('.diff-deleted-line-count, .diff-added-line-count').attr('disabled', true);
          $('.diff-deleted-line-count[data-filename="'+filename+'"]').attr('disabled', false);
          $('.diff-added-line-count[data-filename="'+filename+'"]').attr('disabled', false);

          cd.radioEntrySwitch(previousFilenameNode, filenameNode);

          if (previousFilenameNode !== undefined) {
            diffFileDiv(getFilename(previousFilenameNode)).hide();
          }
          diffFileDiv(getFilename(filenameNode)).show();
          previousFilenameNode = filenameNode;
          currentFilename = filename;

          if (sectionCount > 0 && (reselected || !cd.inArray(filename, alreadyOpened))) {
            var section = $('#' + id + '_section_' + sectionIndex);
            var downFromTop = 250;
            var halfSecond = 500;
            diffSheet.animate({
              scrollTop: '+=' + (section.offset().top - downFromTop) + 'px'
              }, halfSecond);
            sectionIndex += 1;
            sectionIndex %= sectionCount;
          }
          alreadyOpened.push(filename);
        };
      }; // loadFrom()

      $.each(diffs, function(_n, diff) {
        var filename = $('#radio_' + diff.id, diffDiv);
        filename.click(loadFrom(diff));
      });
    }; // buildDiffFilenameHandlers()

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var diffFilenames = $('#diff-filenames', diffDiv);

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var sortedDiffs = function(diffs) {
      var filenames = [];
      $.each(diffs, function(_, diff) {
        filenames.push(diff.filename);
      });
      // ensure filenames appear in the same order as test page
      var sorted = cd.sortedFilenames(filenames);
      var diffFor = function(filename) {
        var i;
        for (i = 0; i < diffs.length; i += 1) {
          if (diffs[i].filename === filename) {
            return diffs[i];
          }
        }
      };
      var result = [];
      $.each(sorted, function(_, filename) {
        result.push(diffFor(filename));
      });
      return result;
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var makeDiffFilenamesColumn = function(diffs) {
      var html = '';
      html += '<table>';
      $.each(sortedDiffs(diffs), function(_, diff) {
        var td = $('<td>');
        var filenameDiv =
          $('<div>', {
              'class': 'filename',
              'data-filename': diff.filename,
              'id': 'radio_' + diff.id,
              'text': diff.filename
          });
        td.append(filenameDiv);
        html += '<tr>' + td.html() + '</tr>';
      });
      html += '</table>';
      return html;
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var makeDiffAddedOrDeletedColumn = function(diffs, propertyName, cssName) {
      var html = '';
      if (!diffCheckBox().is(':checked')) {
        return html;
      }
      html += '<table>';
      $.each(sortedDiffs(diffs), function(_, diff) {
        var count = diff[propertyName];
        var td = $('<td>');
        var noneOrSome = (count === 0) ? 'none' : 'some';
        var div = $('<div>', {
          'class': 'diff-' + cssName + '-line-count ' + noneOrSome + ' button',
          'data-filename': diff.filename
        });
        div.append(count);
        td.append(div);
        html += '<tr>' + td.html() + '</tr>';
      });
      html += '</table>';
      return html;
    };

    var makeDiffDeletedColumn = function(diffs) {
      return makeDiffAddedOrDeletedColumn(diffs, 'deleted_line_count', 'deleted');
    };

    var makeDiffAddedColumn = function(diffs) {
      return makeDiffAddedOrDeletedColumn(diffs, 'added_line_count', 'added');
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var makeDiffFilenames = function(diffs) {
      return '' +
        '<table>' +
          '<tr>' +
            '<td>' +
              makeDiffFilenamesColumn(diffs) +
            '</td>' +
            '<td>' +
              makeDiffDeletedColumn(diffs) +
            '</td>' +
            '<td>' +
              makeDiffAddedColumn(diffs) +
            '</td>' +
          '</tr>' +
        '</table>';
    };

    //- - - - - - - - - - - - -

    var resetFilenameAddedDeletedLineCountHandlers = function() {

      var display = function(node, name, value) {
        if ($(node).attr('disabled') !== 'disabled') {
          var filename = $(node).data('filename');
          var selector = '[id="' + filename + '_diff_div"] ' + name;
          $(selector, diffDiv).css('display', value);
        }
      };

      $('.diff-deleted-line-count', diffDiv)
        .clickToggle(
          function() { display(this, 'deleted', 'none' ); },
          function() { display(this, 'deleted', 'block'); }
        );

      $('.diff-added-line-count', diffDiv)
        .clickToggle(
          function() { display(this, 'added', 'none' ); },
          function() { display(this, 'added', 'block'); }
        );
    };

    //---------------------------------------------------
    // buttons: help fork revert close
    //---------------------------------------------------

    var makeAllButtons = function() {
      var buttons = [ ];
      var makeButton = function(name, handler) {
        return {
          text: name,
          'class': 'history-button',
          click: handler
        };
      };
      buttons.push(makeButton('help', function() {
        var url = 'http://blog.cyber-dojo.org/';
        url += '2014/10/the-cyber-dojo-history-dialog.html';
        window.open(url, '_blank');
      }));
      buttons.push(makeButton('fork', function() {
        doFork();
      }));
      if (showRevert) {
        buttons.push(makeButton('revert', function() {
          doRevert();
          historyDialog.remove();
        }));
      }
      buttons.push(makeButton('close', function() {
        historyDialog.remove();
      }));
      return buttons;
    };

    var forkButton = function() {
      return $('.ui-dialog-buttonset :nth-child(2) :first-child');
    };

    var revertButton = function() {
      return $('.ui-dialog-buttonset :nth-child(3) :first-child');
    };

    //- - - - - - - - - - - - - - -
    // dialog
    //- - - - - - - - - - - - - - -

    var historyDialog = diffDiv.dialog({
      title: cd.dialogTitle(makeTitleHtml()),
      width: 1045,
      modal: true,
      buttons: makeAllButtons(),
      autoOpen: false,
      open: function() { refresh(); },
      closeOnEscape: true,
      close: function() { $(this).remove(); },
    });

    //---------------------------------------------------
    // refresh
    //---------------------------------------------------

    var refresh = function() {
      $('.ui-dialog').addClass('busy');
      $.getJSON('/differ/diff',
        {
          id: id,
          avatar: avatarName,
          was_tag: wasTag(),
          now_tag: nowTag(),
          current_filename: currentFilename
        },
        function(historyData) {
          $('.ui-dialog').removeClass('busy');
          data = historyData;
          refreshDiffCheckBox();
          refreshTrafficLights();
          refreshPrevAvatarHandler();
          refreshAvatarImage();
          refreshNextAvatarHandler();
          refreshTagControls();
          refreshDiff();
          refreshRevertButton();
          refreshForkButton();
          var light = $('img[src$="_bar.png"]', titleBar());
          var options = { direction: 'horizontal', duration: 'slow' };
          light.scrollIntoView(options);
        }
      );
    };

    //---------------------------------------------------
    // fork button
    //---------------------------------------------------

    var makeForkButtonHtml = function() {
      return 'fork from ' + avatarName + ' ' + nowTag();
    };

    var refreshForkButton = function() {
      forkButton().html(makeForkButtonHtml());
    };

    //---------------------------------------------------
    // revert button
    //---------------------------------------------------

    var makeRevertButtonHtml = function() {
      return 'revert to ' + avatarName + ' ' + nowTag();
    };

    var refreshRevertButton = function() {
      if (showRevert) {
        revertButton().html(makeRevertButtonHtml());
      }
    };

    //---------------------------------------------------
    // doRevert()
    //---------------------------------------------------

    var doRevert = function() {
      $.getJSON('/reverter/revert', {
        id: id,
        avatar: avatarName,
        tag: nowTag()
      },
      function(data) {
        deleteAllCurrentFiles();
        copyRevertFilesToCurrentFiles(data.visibleFiles);
        $('#test-button').click();
      });
    };

    //- - - - - - - - - - - - - - -

    var deleteAllCurrentFiles = function() {
      $.each(cd.filenames(), function(_, filename) {
        if (filename !== 'output') {
          cd.doDelete(filename);
        }
      });
    };

    //- - - - - - - - - - - - - - -

    var copyRevertFilesToCurrentFiles = function(visibleFiles) {
      var filename;
      for (filename in visibleFiles) {
        if (filename !== 'output') {
          cd.newFileContent(filename, visibleFiles[filename]);
        }
      }
    };

    //---------------------------------------------------
    // doFork()
    //---------------------------------------------------

    var doFork = function() {
      $.getJSON('/forker/fork', {
        id: id,
        avatar: avatarName,
        tag: nowTag()
      },
      function(data) {
        if (data.forked) {
          forkSucceededDialog(data);
        } else {
          forkFailedDialog(data);
        }
      });
    };

    //- - - - - - - - - - - - - - -

    var forkSucceededDialog = function(fork) {
      var okOrCancel = function(id) {
        var url = '/enter/show/' + id;
        window.open(url);
      };
      cd.newDojoDialog('fork', fork.id, okOrCancel).dialog('open');
    };

    //- - - - - - - - - - - - - - - - - - - - - - - - - -

    var forkFailedDialog = function(data) {
      var html = "" +
        "<div class='dialog'>" +
          "<div class='panel' style='font-size:1em;'>" +
              "On the originating server, " + data.reason + " " + data[data.reason] + " does not exist" +
          "</div>" +
        "</div>";
      var failed =
        $('<div>')
        .html(html)
        .dialog({
          title: cd.dialogTitle('could not fork'),
          autoOpen: false,
          modal: true,
          width: 510,
          buttons: {
            ok: function() {
              $(this).remove();
            }
          }
        });
      failed.dialog('open');
    };

    //- - - - - - - - - - - - - - -

    historyDialog.dialog('open');

  };// dialog_history()

  return cd;

})(cyberDojo || {}, $);
