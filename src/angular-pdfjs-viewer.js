/**
 * angular-pdfjs
 * https://github.com/legalthings/angular-pdfjs
 * Copyright (c) 2015 ; Licensed MIT
 */

+function () {
    'use strict';

    angular.module('pdfjsViewer', []);

    angular.module('pdfjsViewer').directive('pdfjsViewer', ['$interval', '$timeout', function ($interval, $timeout) {
        return {
            templateUrl: file.folder + '../../pdf.js-viewer/viewer.html',
            restrict: 'E',
            scope: {
                onInit: '&',
                onPageLoad: '&',
                scale: '='
            },
            link: function ($scope, $element, $attrs) {
                $element.children().wrap('<div class="pdfjs" style="width: 100%; height: 100%;"></div>');
                
                var initialised = false;
                var loaded = {};
                var numLoaded = 0;

                function onPdfInit() {
                    initialised = true;
                    
                    if ($attrs.removeMouseListeners === "true") {
                        window.removeEventListener('DOMMouseScroll', handleMouseWheel);
                        window.removeEventListener('mousewheel', handleMouseWheel);
                        
                        var pages = document.querySelectorAll('.page');
                        angular.element(pages).children().css('pointer-events', 'none');
                    }
                    if ($scope.onInit) $scope.onInit();
                }

                $interval(function () {
                    if ($scope.scale !== PDFViewerApplication.pdfViewer.currentScale) {
                        loaded = {};
                        numLoaded = 0;
                        $scope.scale = PDFViewerApplication.pdfViewer.currentScale;
                    }
                    
                    var pages = document.querySelectorAll('.page');
                    angular.forEach(pages, function (i, page) {
                        var element = angular.element(page);
                        if (!element.data('loaded')) return;
                        
                        var pageNum = element.data('page-number');
                        if (pageNum in loaded) return;

                        if (!initialised) onPdfInit();
                        
                        loaded[pageNum] = true;
                        numLoaded++;

                        if ($scope.onPageLoad) {
                            $scope.onPageLoad({page: pageNum});
                        }
                    });
                }, 200);

                $scope.$watch(function () {
                    return $attrs.src;
                }, function () {
                    if (!$attrs.src) return;

                    if ($attrs.localeDir) {
                        // not sure how to set locale dir in PDFJS
                    }

                    if ($attrs.cmapDir) {
                        PDFJS.cMapUrl = $attrs.cmapDir;
                    }

                    if ($attrs.imageDir) {
                        PDFJS.imageResourcesPath = $attrs.imageDir;
                    }

                    if ($attrs.open === 'false') {
                        document.getElementById('openFile').setAttribute('hidden', 'true');
                        document.getElementById('secondaryOpenFile').setAttribute('hidden', 'true');
                    }

                    if ($attrs.download === 'false') {
                        document.getElementById('download').setAttribute('hidden', 'true');
                        document.getElementById('secondaryDownload').setAttribute('hidden', 'true');
                    }

                    if ($attrs.print === 'false') {
                        document.getElementById('print').setAttribute('hidden', 'true');
                        document.getElementById('secondaryPrint').setAttribute('hidden', 'true');
                    }

                    if ($attrs.width) {
                        document.getElementById('outerContainer').style.width = $attrs.width;
                    }

                    if ($attrs.height) {
                        document.getElementById('outerContainer').style.height = $attrs.height;
                    }
                    
                    PDFJS.webViewerLoad($attrs.src);
                });
            }
        };
    }]);

    var file = {};
    file.scripts = document.querySelectorAll('script[src]');
    file.path = file.scripts[file.scripts.length - 1].src;
    file.filename = getFileName(file.path);
    file.folder = getLocation(file.path).pathname.replace(file.filename, '');

    function getFileName(url) {
        var anchor = url.indexOf('#');
        var query = url.indexOf('?');
        var end = Math.min(anchor > 0 ? anchor : url.length, query > 0 ? query : url.length);

        return url.substring(url.lastIndexOf('/', end) + 1, end);
    }

    function getLocation(href) {
        var location = document.createElement("a");
        location.href = href;

        if (!location.host) location.href = location.href; // Weird assigned

        return location;
    }
}();