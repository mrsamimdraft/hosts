(function (window, document) {
    "use strict";
    var original_data;
    var data_storage;
    var last_key;
    var env_urls = skGetEnvironmentUrls('linkedin-recommendations');
    var app_url = env_urls.app_url;
    var sk_app_url = env_urls.sk_app_url;
    var sk_api_url = env_urls.sk_api_url;
    var app_backend_url = env_urls.app_backend_url;
    var app_file_server_url = env_urls.app_file_server_url;
    var sk_img_url = env_urls.sk_img_url;
    var $grid;
    var selected_recommendation_type = "received";
    var additional_error_messages = ["Please make sure your <a href='https://www.sociablekit.com/how-to-find-linkedin-profile-id/' target='_blank'>LinkedIn Profile ID</a> is correct."];
    console.log("skdbg");
    var el = document.getElementsByClassName('sk-ww-linkedin-recommendations')[0];
    if (el == undefined) {
        var el = document.getElementsByClassName('dsm-ww-linkedin-recommendations')[0];
        if (el != undefined) {
            el.className = "sk-ww-linkedin-recommendations";
        }
    }
    if (el != undefined) {
        el.innerHTML = "<div class='first_loading_animation' style='text-align:center; width:100%;'><img src='" + app_url + "images/ripple.svg' alt='Loading animation' class='loading-img' style='width:auto !important;' /></div>";
    }
    loadCssFile(app_url + "libs/magnific-popup/magnific-popup.css");
    loadCssFile("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
    loadCssFile(app_url + "libs/swiper/swiper.min.css");
    loadCssFile(app_url + "libs/swiper/swiper.css?v=ranndomchars");

    function loadCssFile(filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        jQuery = window.jQuery;
        scriptLoadHandler();
    }

    function loadScript(url, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        if (typeof callback !== "undefined") {
            if (scriptTag.readyState) {
                scriptTag.onreadystatechange = function () {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        callback();
                    }
                };
            } else {
                scriptTag.onload = callback;
            }
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }

    function scriptLoadHandler() {
        loadScript(app_url + "libs/magnific-popup/jquery.magnific-popup.js", function () {
            loadScript(app_url + "libs/js/masonry/masonry4.2.2.min.js", function () {
                loadScript(app_url + "libs/swiper/swiper.min.js", function () {
                    loadScript(app_url + "libs/js/moment.js", function () {
                        loadScript(app_url + "libs/js/moment-timezone.js", function () {
                            if (typeof window.jQuery == 'undefined' || !window.jQuery) {
                                loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js", function () {
                                    $ = jQuery = window.jQuery.noConflict(true);
                                    main();
                                });
                            } else {
                                $ = jQuery = window.jQuery.noConflict(true);
                                var version = jQuery.fn.jquery;
                                if (version == "3.4.1" || version == "3.3.1") {
                                    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js", function () {
                                        main();
                                    });
                                } else if (version == "3.6.0") {
                                    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js", function () {
                                        main();
                                        onClick();
                                    });
                                } else {
                                    main();
                                }
                            }
                        });
                    });
                });
            });
        });
    }

    function loadMoreTextFeature(sk_linkedin_recommendation, content) {
        var post_link = content.attr("post-link");
        if (content.parent().find(".sk-post-text-new").length > 0)
            return;
        var minimized_elements = content;
        var character_limit = sk_linkedin_recommendation.find('.character_limit').text();
        var maxchars = character_limit;
        if (content.text().length < maxchars || character_limit == 0) {
            return;
        }
        var title = content.text().split("'").join("");
        title = content.text().split('"').join("");
        title = title.trim();
        var $this = minimized_elements;
        $this.hide();
        var children = $this.contents();
        var short_description = jQuery('<div />');
        short_description.addClass("sk-post-text-new");
        var len = children.length;
        var count = 0;
        var i = 0;
        while (i < len) {
            var $elem = $(children[i]).clone();
            var temp_el = $elem;
            var regex = /<br\s*[\/]?>/gi;
            if (temp_el.html() != undefined)
                temp_el.html(temp_el.html().replace(regex, "\n"));
            var text = $elem.text();
            if (text) {
                if (typeof text.trimStart !== "undefined")
                    text = text.trimStart();
            }
            var l = text.length;
            if (count + l > maxchars) {
                var last_word = text.substring(maxchars);
                last_word = last_word.split(/[ ,]+/);
                if (last_word.length > 0) {
                    maxchars = parseInt(maxchars) + parseInt(last_word[0].length);
                }
                var newText = text.slice(0, maxchars);
                if ($elem.get(0).nodeType === 3) {
                    $elem = document.createTextNode(newText);
                } else {
                    $elem.text(newText);
                }
                short_description.append($elem);
                if ($elem instanceof Element)
                    replaceContentWithLinks($elem, sk_linkedin_recommendation);
                break;
            }
            count += l;
            short_description.append($elem);
            i++;
        }
        short_description.append(jQuery('<span>...</span>'));
        $this.after(short_description);
        replaceContentWithLinks(jQuery(short_description), sk_linkedin_recommendation);
        var read_more_text = getDsmSetting(sk_linkedin_recommendation, "read_more_text").trim();
        if (read_more_text.length < 1) {
            read_more_text = "Read more";
        }
        short_description.append(jQuery('<a target="_blank" href="' + post_link + '" class="more sk_readmore_btn">' + read_more_text + '</a>').on('click', function (ev) {
            if (getDsmSetting(sk_linkedin_recommendation, 'show_pop_up') != 1) {
                ev.preventDefault();
                $this.show();
                if (jQuery(this).parent().parent().find(".sk-post-text").find('.sk_show_less').length < 1) {
                    jQuery(this).parent().parent().find(".sk-post-text").append("<a class='sk_show_less'>Show Less</a>");
                    jQuery(this).parent().parent().find(".sk-post-text").find('.sk_show_less').on('click', function () {
                        sk_linkedin_recommendation.find('.grid-content').css({
                            "height": "auto"
                        });
                        sk_linkedin_recommendation.find('.grid-item-linkedin-recommendations').css({
                            "height": "auto"
                        });
                        jQuery(this).parent().parent().find(".sk-post-text:first").hide();
                        jQuery(this).parent().parent().find(".sk-post-text-new:first").show();
                        if (getDsmSetting(sk_linkedin_recommendation, "layout") == 1) {
                            makeResponsive(jQuery, sk_linkedin_recommendation);
                        }
                    });
                    jQuery(this).parent().parent().find(".sk-post-text").find('.sk_show_less').css({
                        'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size") + 'px',
                        'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
                    });
                }
                short_description.hide();
                sk_linkedin_recommendation.find('.grid-content').css({
                    "height": "auto"
                });
                sk_linkedin_recommendation.find('.grid-item-linkedin-recommendations').css({
                    "height": "auto"
                });
            }
            if (getDsmSetting(sk_linkedin_recommendation, "layout") == 1) {
                makeResponsive(jQuery, sk_linkedin_recommendation);
            }
            fixMasonry();
        }));
        short_description.css({
            "color": getDsmSetting(sk_linkedin_recommendation, "details_font_color")
        });
        sk_linkedin_recommendation.find('.sk_readmore_btn').css({
            'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size") + 'px',
            'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
        });
    }

    function removeAttrWithKey(object_element, character_limit) {
        object_element.find('a,span,div').each(function () {
            var element = jQuery(this);
            var attr_to_remove = [];
            element.each(function () {
                jQuery.each(this.attributes, function () {
                    if (this.specified) {
                        if (this.name && (this.name.includes('data-') || this.name.includes('dir') || this.name.includes('tabindex'))) {
                            attr_to_remove.push(this.name);
                        }
                    }
                });
            });
            jQuery.each(attr_to_remove, function (index, val) {
                element.removeAttr(val);
            });
        });
        var count_characters = 0;
        var element_html = object_element.html().substr(0, character_limit + 300);
        var div = document.createElement("div");
        div.innerHTML = element_html;
        element_html = div.innerHTML;
        object_element.closest('div.post-content').find('.sk-manipulated-description').html(element_html);
        object_element.closest('div.post-content').find('.sk-manipulated-description').find('div,span,a').each(function (i, v) {
            count_characters += jQuery(v).attr('href') ? jQuery(v).attr('href').length + 9 : 0;
            count_characters += jQuery(v).attr('class') ? jQuery(v).attr('class').length + 11 : 0;
            count_characters += jQuery(v).attr('style') ? jQuery(v).attr('style').length + 11 : 0;
            count_characters += jQuery(v).attr('title') ? jQuery(v).attr('title').length + 11 : 0;
            count_characters += jQuery(v).attr('target') ? jQuery(v).attr('target').length + 11 : 0;
        });
        return count_characters;
    }

    function nl2br(str, is_xhtml) {
        if (typeof str === 'undefined' || str === null) {
            return '';
        }
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    function replaceContentWithLinks(html, sk_linkedin_recommendation) {
        var text = html.html();
        if (text) {
            text = text.replace(/(\r\n|\n\r|\r|\n)/g, "");
            var splitted_text = text.split(' ');
            if (splitted_text && splitted_text.length > 0) {
                jQuery.each(splitted_text, function (key, value) {
                    if (value.charAt(0) == "#") {
                        var original_text = value.replace('#', '');
                        text = text.replace(' ' + value, ' <a target="_blank" href="https://www.linkedin.com/feed/hashtag/?keywords=' + original_text + '">' + value + '</a>');
                    } else if (value.charAt(0) == "@") {
                        var original_text = value.replace('@', '');
                        text = text.replace(' ' + value, ' <a target="_blank" href="https://www.linkedin.com/' + original_text + '">' + value + '</a>');
                    }
                });
                text = text.split('<br>#').join('<br> #');
                var splitted_text = text.split(' ');
                jQuery.each(splitted_text, function (key, value) {
                    if (value.charAt(0) == "#") {
                        var original_text = value.replace('#', '');
                        text = text.replace(' ' + value, ' <a target="_blank" href="http://facebook.com/hashtag/' + original_text + '">' + value + '</a>');
                    } else if (value.charAt(0) == "@") {
                        var original_text = value.replace('@', '');
                        text = text.replace(' ' + value, ' <a target="_blank" href="http://facebook.com/' + original_text + '">' + value + '</a>');
                    } else if (value.charAt(0) != "<" && value.indexOf('http') != -1 && value.indexOf('href=') == -1 && value.indexOf('target=') == -1 && value.indexOf('">') == -1) {
                        text = text.replace(' ' + value, ' <a target="_blank" href="' + value + '">' + value + '</a>');
                    }
                });
            }
            html.html(text);
            sk_linkedin_recommendation.find('a').css({
                'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size") + 'px',
                'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
            });
            applyPopUpColors(sk_linkedin_recommendation);
        }
    }

    function replaceHttpToLink(content) {
        var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var element_content = content.replace(exp_match, '<a class="href_status_trigger hide-link" target="_blank" href="$1">$1</a>');
        var new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var new_content = element_content.replace(new_exp_match, '$1<a class="href_status_trigger hide-link" target="_blank" href="http://$2">$2</a>');
        return new_content;
    }

    function getDsmEmbedId(sk_linkedin_recommendation) {
        var embed_id = sk_linkedin_recommendation.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_linkedin_recommendation.attr('data-embed-id');
        }
        return embed_id;
    }

    function getDsmSetting(sk_linkedin_recommendation, key) {
        return sk_linkedin_recommendation.find("." + key).text();
    }

    function showLinkedinData(posts) {
        jQuery.each(posts, function (key, val) {
            val.id = val.id.replace("&", "and_sign");
            val.id = val.id.replace(".", "dot");
            var meta_holder = jQuery("#meta_holder_" + val.id);
            if (val.post_url && meta_holder.length) {
                if (val.shared_post_description) {
                    var html = "<a link-only target='_blank'>";
                    html += "<div class='sk-link-article-container' style='background: #eeeeee;color: black !important; font-weight: bold !important; border-radius: 2px; border: 1px solid #c3c3c3; box-sizing: border-box; word-wrap: break-word;'>";
                    val.shared_post_description = val.shared_post_description.replace("_self", "_blank");
                    html += "<div class='sk-link-article-description' style='padding: 8px;color: #000000;font-weight: 100;font-size: 14px;'>" + val.shared_post_description + "</div>";
                    html += "</div>";
                    html += "</a>";
                    meta_holder.html(html);
                }
                showUrlData(meta_holder, val.post_url, val.id);
                if (val.images && val.images.length == 1) {
                    setTimeout(function () {
                        meta_holder.find('img.sk_post_img_link').attr('src', val.images[0]);
                    }, (key + 1) * 800);
                }
            }
        });
    }

    function replaceBigFontSize(sk_linkedin_recommendation) {
        var attrs = {};
        if (sk_linkedin_recommendation.find('h2').length < 1) {
            return;
        }
        jQuery.each(sk_linkedin_recommendation.find('h2')[0].attributes, function (idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });
        sk_linkedin_recommendation.find('.sk_meta_holder_description h2').replaceWith(function () {
            return jQuery("<p />", attrs).append($(this).contents());
        });
    }

    function predefinedPostFeature(data_storage, predefined_search_keyword) {
        var new_posts_list = [];
        for (let item of data_storage) {
            if (item) {
                if (item.description && item.description.indexOf(predefined_search_keyword) != -1) {
                    new_posts_list.push(item);
                }
            }
        };
        return new_posts_list;
    }

    function moderationTabFeature(sk_linkedin_recommendation, data_storage) {
        var turnon_preapproval_posts = 0;
        var preapproved_posts = [];
        var excluded_posts = [];
        if (getDsmSetting(sk_linkedin_recommendation, "preapproved_posts") != "") {
            preapproved_posts = getDsmSetting(sk_linkedin_recommendation, "preapproved_posts").split(",");
        }
        if (getDsmSetting(sk_linkedin_recommendation, "excluded_posts") != "") {
            excluded_posts = getDsmSetting(sk_linkedin_recommendation, "excluded_posts").split(",");
        }
        for (let item of data_storage) {
            if (item) {
                if (preapproved_posts.includes(item.id)) {
                    turnon_preapproval_posts = 1;
                    break;
                }
            }
        }
        var new_posts_list = [];
        for (let item of data_storage) {
            if (item) {
                if (turnon_preapproval_posts == 1) {
                    if (preapproved_posts.includes(item.id)) {
                        new_posts_list.push(item);
                    }
                } else {
                    if (turnon_preapproval_posts == 0 && excluded_posts.includes(item.id)) {} else {
                        new_posts_list.push(item);
                    }
                }
            }
        };
        return new_posts_list;
    }

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    function applyDateFormat(sk_linkedin_recommendation, data_storage) {
        var date_format = getDsmSetting(sk_linkedin_recommendation, 'date_format');
        var use_24_hour_clock = getDsmSetting(sk_linkedin_recommendation, 'use_24_hour_clock');
        var show_post_date = getDsmSetting(sk_linkedin_recommendation, 'show_post_date');
        var format = 'MMM D, YYYY';
        if (date_format == 'M d, Y') {
            format = 'MMM D, YYYY';
        } else if (date_format == 'F Y') {
            format = 'MMMM YYYY';
        } else if (date_format == 'M Y') {
            format = 'MMM YYYY';
        } else if (date_format == 'jS M Y') {
            format = 'Do MMM YYYY';
        } else if (date_format == 'Y M jS') {
            format = 'YYYY MMM Do';
        } else if (date_format == 'Y-m-d') {
            format = 'YYYY-MM-D';
        } else if (date_format == 'm/d/Y') {
            format = 'MM/D/YYYY';
        } else if (date_format == 'd/m/Y') {
            format = 'D/MM/YYYY';
        } else if (date_format == 'd.m.Y') {
            format = 'D.MM.YYYY';
        } else if (date_format == 'd-m-Y') {
            format = 'D-MM-YYYY';
        }
        var new_posts_lists = [];
        jQuery.each(data_storage, function (index, value) {
            if (data_storage[index] && data_storage[index].post_date_time) {
                var date_time = data_storage[index].created_time;
                if (date_format == 'ago_value') {
                    data_storage[index].post_date_time = timeAgo(new Date(data_storage[index].post_date_time));
                } else {
                    data_storage[index].post_date_time = moment(data_storage[index].post_date_time).format(format);
                }
            }
        });
        return data_storage;
    }

    function timeAgo(date) {
        var NOW = new Date();
        var times = [
            ["s", 1],
            ["min", 60],
            ["h", 3600],
            ["d", 86400],
            ["w", 604800],
            ["m", 2592000],
            ["yr", 31536000]
        ]
        var diff = Math.round((NOW - date) / 1000);
        for (var t = 0; t < times.length; t++) {
            if (diff < times[t][1]) {
                if (t == 0) {
                    return "Just now"
                } else {
                    diff = Math.round(diff / times[t - 1][1])
                    return diff + "" + times[t - 1][0];
                }
            }
        }
        if (diff >= times[6][1]) {
            diff = Math.round(diff / times[t - 1][1])
            return diff + "" + times[t - 1][0];
        }
    }

    function sortPosts(data) {
        var new_posts_list = [];
        if (data) {
            data.sort(function (a, b) {
                return new Date(b.post_date).getTime() - new Date(a.post_date).getTime();
            });
            for (let item of data) {
                if (typeof item != 'undefined') {
                    new_posts_list.push(item);
                }
            }
        }
        return new_posts_list;
    }

    function getActiveRecommendations(sk_linkedin_recommendation, data) {
        var new_lists = [];
        for (let item of data) {
            if (selected_recommendation_type == "received" && item.received === "true") {
                new_lists.push(item);
            }
            if (selected_recommendation_type == "given" && item.received === "false") {
                new_lists.push(item);
            }
        };
        return new_lists;
    }

    function requestFeedData(sk_linkedin_recommendation) {
        var embed_id = getDsmEmbedId(sk_linkedin_recommendation);
        var json_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
        jQuery.getJSON(json_url, function (data) {
            original_data = data;
            loadFeed(sk_linkedin_recommendation);
        }).fail(function (e) {
            generateSolutionMessage(sk_linkedin_recommendation, embed_id);
        });
    }

    function loadFeed(sk_linkedin_recommendation) {
        var data = original_data;
        var predefined_search_keyword = getDsmSetting(sk_linkedin_recommendation, "predefined_search_keyword");
        var turnon_preapproval_posts = getDsmSetting(sk_linkedin_recommendation, "turnon_preapproval_posts");
        var embed_id = getDsmEmbedId(sk_linkedin_recommendation);
        if (original_data.user_info && !widgetValidation(sk_linkedin_recommendation, data)) {
            return;
        } else if (!data.posts || data.posts.length == 0) {
            data.user_info.show_feed = false;
            generateSolutionMessage(sk_linkedin_recommendation, embed_id);
            return;
        } else {
            data_storage = data.posts;
            data_storage = sortPosts(data_storage);
            if (data_storage && data_storage.length > 0) {
                var received_items = [];
                var given_items = [];
                for (var i = 0; i < data_storage.length; i++) {
                    if (data_storage[i].received === "true") {
                        received_items.push(data_storage[i]);
                    } else {
                        given_items.push(data_storage[i]);
                    }
                }
                if (received_items && received_items.length) {
                    data_storage = moderationTabFeature(sk_linkedin_recommendation, received_items);
                }
                if (getDsmSetting(sk_linkedin_recommendation, 'show_given_recommendations') == 1 && given_items && given_items.length) {
                    if (getDsmSetting(sk_linkedin_recommendation, 'show_received_recommendations') == 1) {
                        data_storage = data_storage.concat(moderationTabFeature(sk_linkedin_recommendation, given_items));
                    } else {
                        data_storage = moderationTabFeature(sk_linkedin_recommendation, given_items);
                    }
                }
            }
            data_storage = getActiveRecommendations(sk_linkedin_recommendation, data_storage);
            data_storage = applyDateFormat(sk_linkedin_recommendation, data_storage);
            if (predefined_search_keyword) {
                data_storage = predefinedPostFeature(data_storage, predefined_search_keyword);
            }
            var post_items = "";
            post_items += "<div class='sk-recommendation-type-feed-container'>";
            post_items += "<div class='sk-recommendation-type-main-container' style='visibility: hidden; display:none !important;'>";
            post_items += '<div class="sk-recommendation-type-container">';
            if (getDsmSetting(sk_linkedin_recommendation, 'show_received_recommendations') == 1) {
                var received_text = getDsmSetting(sk_linkedin_recommendation, 'received_recommendations_text')
                var header_text = received_text ? received_text : "Received";
                post_items += '<button class="sk-tab-active recommendation_type_btn received-btn" type="received">' + header_text + '</button>';
            }
            if (getDsmSetting(sk_linkedin_recommendation, 'show_given_recommendations') == 1) {
                var given_text = getDsmSetting(sk_linkedin_recommendation, 'given_recommendations_text')
                var header_text = given_text ? given_text : "Given";
                if (getDsmSetting(sk_linkedin_recommendation, 'show_received_recommendations') != 1) {
                    post_items += '<button class="sk-tab-active recommendation_type_btn given-btn" type="given">' + header_text + '</button>';
                } else {
                    var header_text = getDsmSetting(sk_linkedin_recommendation, 'given_recommendations_text')
                    post_items += '<button class="sk-tab-inactive recommendation_type_btn given-btn" type="given">' + header_text + '</button>';
                }
            }
            post_items += '</div>';
            post_items += "</div>";
            if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 3) {
                post_items += loadSliderLayout(sk_linkedin_recommendation, data);
            } else {
                post_items += "<div class='grid-linkedin-recommendations'>";
                post_items += "<div class='grid-sizer-linkedin-recommendations'>";
                var post_count = getDsmSetting(sk_linkedin_recommendation, "post_count");
                var posts_length = data.posts.length;
                var post_counter = 1;
                post_items += "</div>";
                var enable_button = false;
                last_key = parseInt(getDsmSetting(sk_linkedin_recommendation, 'post_count'));
                if (data_storage.length > last_key) {
                    enable_button = true;
                }
                if (data_storage.length > 0) {
                    for (var i = 0; i < last_key; i++) {
                        if (typeof data_storage[i] != 'undefined') {
                            post_items += post_counter <= post_count ? "<div class='linkedin_recommendation'>" : "<span class='sk_post_item' style='display:none;'>";
                            post_items += getFeedItem(data_storage[i], sk_linkedin_recommendation);
                            post_items += "</div>";
                            post_counter++;
                        }
                    }
                } else {
                    var instructions = "No recommendation yet. Please check back later!";
                    if (typeof data.instructions != 'undefined' && data.instructions) {
                        instructions = data.instructions;
                    }
                    post_items += "<div class='sk-error-message'>" + instructions + "</div>";
                }
                post_items += "</div>";
                if (getDsmSetting(sk_linkedin_recommendation, "show_load_more_button") == 1 && enable_button == true) {
                    post_items += "<div class='sk-linkedin-recommendations-bottom-btn-container'>";
                    post_items += "<button type='button' class='sk-linkedin-recommendations-load-more-posts'>";
                    post_items += getDsmSetting(sk_linkedin_recommendation, "load_more_posts_text");
                    post_items += "</button>";
                    post_items += "</div>";
                }
            }
            post_items += skGetBranding(sk_linkedin_recommendation, data.user_info);
            post_items += "</div>";
            sk_linkedin_recommendation.append(post_items);
            if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 3) {
                skLayoutSliderSetting(sk_linkedin_recommendation);
                skLayoutSliderArrowUI(sk_linkedin_recommendation);
            }
            replaceBigFontSize(sk_linkedin_recommendation);
            jQuery('.sk_meta_holder .feed-shared-article__subtitle').each(function (i, v) {
                var txt_val = jQuery(v).text();
                if (txt_val.indexOf("â€¢") != -1) {
                    txt_val = txt_val.substring(0, txt_val.indexOf('â€¢'));
                }
                jQuery(v).text(txt_val);
            });
            for (var i = 0; i < jQuery('.sk-post-text').length; i++) {
                loadMoreTextFeature(sk_linkedin_recommendation, jQuery(jQuery('.sk-post-text')[i]));
            }
            if (posts_length < 1) {
                sk_linkedin_recommendation.find('.grid-linkedin-recommendations').css({
                    "height": "40px",
                    "text-align": "center"
                });
            } else {
                fixMasonry();
            }
            if (sk_linkedin_recommendation.find('.sk-linkedin-recommendations-profile-description').length > 0) {
                replaceContentWithLinks(sk_linkedin_recommendation.find('.sk-linkedin-recommendations-profile-description'), sk_linkedin_recommendation);
            }
            applyCustomUi(jQuery, sk_linkedin_recommendation);
            applyMasonry();
            sk_increaseView(data.user_info);
            sk_linkedin_recommendation.find('a').each(function () {
                jQuery(this).attr('target', '_blank');
            });
        }
    }

    function mediaItem(val) {
        var post_items = "";
        post_items += "<div class='sk_post_media '>";
        var media_content = "";
        var multiple_photos = "";
        var media_content_trigger = "";
        if (val.embed_source && val.embed_source.includes("linkedin.com") == true && val.images && val.images.length > 0) {
            post_items += "<a href='" + val.embed_source + "' target='_blank' ><image alt='No alternative text description for this image' class='sk-width-100p' src='" + val.images[0] + "'/></a>";
        } else if (val.embed_source && val.embed_source.includes("linkedin.com") == true && val.images.length < 1) {
            post_items += "<iframe src='" + val.embed_source + "?compact=1'";
            post_items += "height='349' width='100%' frameborder='0' allowfullscreen='' title='Embedded post'></iframe>";
        } else if (val.embed_source && val.embed_source.includes("linkedin.com") == false) {
            if (val.embed_source.includes("vimeo.com")) {
                val.embed_source = "https://player.vimeo.com/video/" + val.embed_source.substring(val.embed_source.lastIndexOf("/") + 1);
            }
            var embed_source = val.embed_source;
            if (embed_source.indexOf("youtu") != -1) {
                embed_source = embed_source.replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/');
                embed_source = embed_source.replace('https://youtu.be/', 'https://www.youtube.com/embed/');
                if (embed_source.indexOf("&") != -1) {
                    embed_source = embed_source.substring(0, embed_source.indexOf('&'));
                }
            }
            post_items += "<iframe src='" + embed_source + "'";
            post_items += "height='400' width='100%' frameborder='0' allowfullscreen='' title='Embedded post'></iframe>";
        } else if (val.shared_post_description && val.shared_post_description.indexOf('sk-feed-shared-event') != -1) {
            post_items += "<div class='sk_meta_holder'>";
            post_items += "<div class='sk_meta_holder_description'>";
            post_items += val.shared_post_description;
            post_items += "</div>";
            post_items += "</div>";
        } else if (val.post_url && val.thumbnail != 'undefined' && val.thumbnail && val.shared_post_description) {
            if (val.post_url.includes("https://www.linkedin.comundefined")) {
                val.post_url = val.post_link;
            }
            post_items += "<div class='sk_meta_holder'>";
            post_items += "<div class='image-item'>";
            post_items += "<a class='sk_meta_holder_link' target='_blank' href='" + val.post_url + "'>";
            post_items += "<img alt='No alternative text description for this image' style='width:100%;' src='" + val.thumbnail + "' />";
            post_items += "</a>";
            post_items += "</div>";
            if (val.shared_post_description && val.shared_post_description != "undefined") {
                post_items += "<div class='sk_meta_holder_description'>";
                post_items += val.shared_post_description;
                post_items += "</div>";
            }
            post_items += "</div>";
        } else if (val.images && val.images.length > 0 && val.shared_post_description && val.post_url) {
            var url_thumbnail = val.images[0];
            post_items += "<div class='sk_meta_holder'>";
            post_items += "<div class='image-item'>";
            post_items += "<a target='_blank' href='" + val.post_url + "'>";
            post_items += "<img alt='No alternative text description for this image' style='width:100%;' src='" + url_thumbnail + "' />";
            post_items += "</a>";
            post_items += "</div>";
            post_items += "<div class='sk_meta_holder_description'>";
            if (val.shared_post_description != 'undefined') {
                post_items += val.shared_post_description;
            }
            post_items += "</div>";
            post_items += "</div>";
        } else if (val.video_url) {
            post_items += "<div class='sk_video_holder'>";
            post_items += "<div class='sk_play_button'><i class='fa fa-play-circle' aria-hidden='true'></i></div>"
            post_items += "<video class='sk_post_img display-none' controls>";
            post_items += "<source src='" + val.video_url + "' type='video/mp4'>";
            post_items += "Your browser does not support the video tag.";
            post_items += "</video>";
            post_items += "<image alt='No alternative text description for this image' class='sk_post_img' src='" + val.thumbnail + "'/>";
            post_items += "</div>";
        } else if (val.images && val.images.length > 0 && !val.post_url) {
            var sk_hidden_in_pop_up = "";
            var plus = "";
            if (val.images.length > 0) {
                plus = "4+";
            }
            if (val.images.length > 1)
                sk_hidden_in_pop_up = "sk_post_img-popup-hidden";
            if (val.images.length > 1) {
                if (val.images.length == 2) {
                    var media_attachments = val.images.slice(0, 2);
                    post_items += "<div class='" + sk_hidden_in_pop_up + " photo-grid-2 sk_post_type_photo'>";
                    jQuery.each(media_attachments, function (i, v) {
                        post_items += "<div class='image-item'>";
                        post_items += "<img alt='No alternative text description for this image' src='" + v + "' class='sk_post_img' />";
                        post_items += "</div>";
                    });
                    post_items += "</div>";
                } else if (val.images.length == 3) {
                    var media_attachments = val.images.slice(0, 3);
                    jQuery.each(media_attachments, function (i, v) {
                        if (i == 0) {
                            post_items += "<div class='three_photo " + sk_hidden_in_pop_up + " photo-grid-3 sk_post_type_photo'>";
                            post_items += "<div class='image-item'>";
                            post_items += "<img alt='No alternative text description for this image' src='" + v + "' class='sk_post_img first-image' />";
                            post_items += "</div>";
                            post_items += "</div>";
                        }
                    });
                    post_items += "<div class='" + sk_hidden_in_pop_up + " photo-grid-2 sk_post_type_photo'>";
                    jQuery.each(media_attachments, function (i, v) {
                        if (i != 0) {
                            post_items += "<div class='image-item'>";
                            post_items += "<img alt='No alternative text description for this image' src='" + v + "' class='sk_post_img' />";
                            post_items += "</div>";
                        }
                    });
                    post_items += "</div>";
                } else if (val.images.length >= 4) {
                    var media_attachments = val.images.slice(0, 4);
                    post_items += "<div class='" + sk_hidden_in_pop_up + " photo-grid-2 sk_post_type_photo'>";
                    jQuery.each(media_attachments, function (i, v) {
                        if (i == 3)
                            post_items += "<div style='position: relative; display: inline-block;' class='image-item'>";
                        else
                            post_items += "<div class='image-item'>";
                        post_items += "<img alt='No alternative text description for this image' src='" + v + "' class='sk_post_img' />";
                        if (i == 3 && val.images.length > 4) {
                            post_items += "<div class='img-count'> " + plus + " </div>";
                        }
                        post_items += "</div>";
                    });
                    post_items += "</div>";
                }
                var media_attachments = val.images;
                media_content_trigger = 'media_content_trigger';
                multiple_photos += '<div class="swiper-container swiper-container-single">';
                multiple_photos += '<div class="swiper-wrapper">';
                jQuery.each(media_attachments, function (index, value) {
                    multiple_photos += "<div class='swiper-slide'><img alt='No alternative text description for this image' class='sk_post_img' style='width: 100%; margin: 0px !important;' src='" + value + "'/></div>";
                });
                multiple_photos += '</div>';
                multiple_photos += '<div class="swiper-button-next-single"><i class="mfp-arrow mfp-arrow-right"></i></div>';
                multiple_photos += '<div class="swiper-button-prev-single"><i class="mfp-arrow mfp-arrow-left"></i></div>';
                multiple_photos += '</div>';
                post_items += "<div class='multiple_photos'>" + multiple_photos + "</div>";
            } else if (val.images.length == 1) {
                post_items += "<image alt='No alternative text description for this image' class='sk_post_img " + sk_hidden_in_pop_up + "' src='" + val.images[0] + "'/>";
            }
        } else if (val.post_url && val.post_url.indexOf("https://www.linkedin.com/feed/update/") == -1) {
            val.post_url = val.post_url.replace("app=desktop&", "");
            val.id = val.id.replace("&", "and_sign");
            val.id = val.id.replace(".", "dot");
            var add_text = "";
            if (val.images.length == 1 && val.images[0].includes('IcPK-K-b7SDn94UXnIfp98mhm7cPbSHNV_C6oB63rgY')) {
                add_text = "<b>Opere d'arte sotto controllo - Vision Journal</b>";
            }
            post_items += "<div id='meta_holder_" + val.id + "'>" + add_text + "</div>";
        } else if (val.post_url) {
            if (val.post_url && val.post_url.includes("linkedin.com/company")) {
                post_items += "<div class='sk_meta_holder'>";
                post_items += "<div class='image-item'>";
                post_items += "<a target='_blank' href='" + val.post_url + "'>";
                post_items += "<img alt='No alternative text description for this image' style='width:100%;' src='" + val.thumbnail + "' />";
                post_items += "</a>";
                post_items += "</div>";
                post_items += "<div class='sk_meta_holder_description'>";
                var descArr = val.post_url.split("/");
                var desc = "";
                if (descArr.length > 1) {
                    if (descArr[descArr.length - 1].length > 0) {
                        desc = descArr[descArr.length - 1];
                    } else {
                        desc = descArr[descArr.length - 2];
                    }
                } else {
                    desc = descArr[0];
                }
                desc = desc + " | " + "LinkedIn";
                desc = desc + "<br>" + "linkedin.com";
                post_items += desc;
                post_items += "</div>";
                post_items += "</div>";
            } else {}
        } else if (typeof val.thumbnail != 'undefined' && val.thumbnail != 'undefined') {
            post_items += "<image alt='No alternative text description for this image' class='sk_post_img' src='" + val.thumbnail + "'/>";
        }
        post_items += "</div>";
        return post_items;
    }

    function getFeedItem(val, sk_linkedin_recommendation) {
        var post_items = "";
        var show_post_icon = getDsmSetting(sk_linkedin_recommendation, "show_post_icon");
        var show_time_posted = getDsmSetting(sk_linkedin_recommendation, "show_time_posted");
        if (typeof val.post_url == 'undefined' || val.post_url == 'undefined') {
            val.post_url = "";
        }
        post_items += "<div class='grid-item-linkedin-recommendations grid-item-linkedin-recommendations-" + val.id + "'>";
        post_items += "<div class='grid-content'>";
        var post_header = "";
        if (getDsmSetting(sk_linkedin_recommendation, 'show_profile_picture') == 1 || getDsmSetting(sk_linkedin_recommendation, 'show_profile_name') == 1 || getDsmSetting(sk_linkedin_recommendation, 'show_post_date') == 1) {
            post_header += "<div class='post-header'>";
            if (getDsmSetting(sk_linkedin_recommendation, 'show_profile_picture') == 1) {
                post_header += "<div class='post-image'>";
                if (!val.profile_image || val.profile_image.length < 1) {
                    val.profile_image = app_url + "images/li-default.png";
                }
                post_header += "<img alt='Profile image of " + val.profile_name + "' src='" + val.profile_image + "' class='img-thumbnail'>";
                post_header += "</div>";
            }
            val.profile_link = val.profile_link.replace("/details/recommendations/?detailScreenTabIndex=1", "");
            post_header += "<div class='sk-fb-profile-name'>";
            if (getDsmSetting(sk_linkedin_recommendation, 'show_profile_name') == 1) {
                post_header += "<strong><a class='href_status_trigger_post profile-name' href='" + val.profile_link + "' target='_blank'>" + val.profile_name + "</a></strong> ";
            }
            if (getDsmSetting(sk_linkedin_recommendation, 'show_post_date') == 1) {
                post_header += "<div><span class='sk-secondary-data'>";
                post_header += val.post_date_time;
                post_header += "</span></div>";
            }
            post_header += "</div>";
            post_header += "</div>";
        }
        post_items += post_header;
        post_items += "<div class='post-content'>";
        post_items += "<div class='margin-zero'>";
        post_items += "<div class='sk-post-description href_status_trigger_post_container sk-post-text sk-post-text-" + val.id + "' post-link='https://www.linkedin.com/in/" + val.id + "/details/recommendations/?detailScreenTabIndex=1&description=true'>";
        if (getDsmSetting(sk_linkedin_recommendation, 'show_job_name') == 1) {
            post_items += "<div><span class='sk-secondary-data'>";
            post_items += "<b>" + val.profile_position + "</b>";
            post_items += "</span></div><br>";
        }
        post_items += "<div><span class='sk-secondary-data'>";
        post_items += val.profile_notes;
        post_items += "</span></div><br>";
        post_items += val.description;
        post_items += "</div>";
        post_items += "<div class='sk-short-description' style='display:none;'>" + val.description + "<span class='sk-see-less'>" + getDsmSetting(sk_linkedin_recommendation, 'read_more_text') + "</span></div>";
        post_items += "<div class='sk-long-description' style='display:none;'>" + val.description + "</div>";
        post_items += "<div class='sk-manipulated-description' style='display:none;'></div>";
        if (val.shared_post_owner_name != undefined && val.shared_post_owner_name != null && val.shared_post_owner_name != "") {
            var shared_post_header = "";
            if (val.shared_post_owner_picture.length < 1) {
                val.shared_post_owner_picture = app_url + "images/li-default.png";
            }
            shared_post_header += "<div class='sk-linkedin-recommendations-shared-info'><div class='post-header'>";
            shared_post_header += "<div class='post-image'>";
            shared_post_header += "<img alt='Profile image of " + val.profile_name + " on the popup' src='" + val.shared_post_owner_picture + "' class='img-thumbnail'>";
            shared_post_header += "</div>";
            shared_post_header += "<div class='sk-fb-profile-name'>";
            shared_post_header += "<strong><a href='" + val.shared_post_owner_link + "&popupOwnerName=true' class='href_status_trigger_post profile-name'>" + val.shared_post_owner_name + "</a></strong> ";
            shared_post_header += "<div><span class='sk-secondary-data'>";
            shared_post_header += val.shared_post_date;
            shared_post_header += "<div class='sk-linkedin-shared-post-owner-description'>" + val.shared_post_owner_description + "</div>";
            shared_post_header += "</span></div>";
            shared_post_header += "</div>";
            shared_post_header += "</div>";
            post_items += shared_post_header;
            if (val.shared_post_description && val.shared_post_description != undefined && val.shared_post_description != "undefined") {
                post_items += "<div class='href_status_trigger_post_container sk-post-text sk-post-text-" + val.id + "'>";
                post_items += val.shared_post_description;
                post_items += "</div>";
            }
            post_items += mediaItem(val);
            post_items += "</div>";
        } else {
            post_items += mediaItem(val);
        }
        post_items += "</div>";
        post_items += "</div>";
        if (show_post_icon == 1) {
            post_items += "<div class='post-post-counts'>";
            post_items += "<span class='sk-linkedin-recommendations-m-r-15px sk_post_view_on_facebook'>";
            post_items += "<a class='href_status_trigger_post' href='https://www.linkedin.com/in/" + val.id + "/details/recommendations/?detailScreenTabIndex=1&fromSK=1' target='_blank'>&nbsp; &#8203;<i class='fa fa-linkedin' aria-hidden='true'></i></a>";
            post_items += "</span>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "<div class='white-popup mfp-hide sk-popup-container'>";
        post_items += mediaItem(val);
        post_items += "<div class='sk-popup-post-content'>";
        post_items += "<div class='sk-popup-post-content-details'>";
        post_items += post_header;
        if (getDsmSetting(sk_linkedin_recommendation, 'show_job_name') == 1) {
            post_items += "<div><span class='sk-secondary-data'>";
            post_items += "<b>" + val.profile_position + "</b>";
            post_items += "</span></div><br>";
        }
        post_items += "<div><span class='sk-secondary-data'>";
        post_items += val.profile_notes;
        post_items += "</span></div><br>";
        post_items += "<div class='sk-post-description href_status_trigger_post_container sk-post-text sk-post-text-" + val.id + "' post-link='https://www.linkedin.com/in/" + val.id + "/details/recommendations/?detailScreenTabIndex=1&fromPopup=true'>";
        post_items += val.description;
        post_items += "</div>";
        if (show_post_icon == 1) {
            post_items += "<div class='post-post-counts'>";
            post_items += "<span class='sk-linkedin-recommendations-m-r-15px sk_post_view_on_facebook'>";
            post_items += "<a class='href_status_trigger_post' href='https://www.linkedin.com/in/" + val.id + "/details/recommendations/?detailScreenTabIndex=1&viewOnPopup=true' target='_blank'>&nbsp; &#8203;<i class='fa fa-linkedin' aria-hidden='true'></i></a>";
            post_items += "</span>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        return post_items;
    }

    function applyMasonry() {
        $grid = new Masonry('.grid-linkedin-recommendations', {
            itemSelector: '.grid-item-linkedin-recommendations',
            columnWidth: '.grid-sizer-linkedin-recommendations',
            percentPosition: true,
            transitionDuration: 0
        });
        var sk_linkedin_recommendation = jQuery(".sk-ww-linkedin-recommendations");
        if (sk_linkedin_recommendation.find('.sk-error-message').length) {
            sk_linkedin_recommendation.find('.sk-error-message').css('height', '40px');
            sk_linkedin_recommendation.find('.sk-error-message').closest('.grid-linkedin-recommendations').css('height', '40px');
        }
    }

    function fixMasonry() {
        setTimeout(function () {
            applyMasonry();
        }, 500);
        setTimeout(function () {
            applyMasonry();
        }, 1000);
        setTimeout(function () {
            applyMasonry();
        }, 2000);
        setTimeout(function () {
            applyMasonry();
        }, 3000);
        setTimeout(function () {
            applyMasonry();
        }, 4000);
        setTimeout(function () {
            applyMasonry();
        }, 5000);
        setTimeout(function () {
            applyMasonry();
        }, 6000);
        setTimeout(function () {
            applyMasonry();
        }, 7000);
        setTimeout(function () {
            applyMasonry();
        }, 8000);
    }

    function loadSliderLayout(sk_linkedin_recommendation, data) {
        var post_items = "";
        post_items += "<button type='button' class='swiper-button-next ' style='pointer-events: all;'>";
        post_items += "<i class='sk-arrow sk-arrow-right'></i>";
        post_items += "</button>";
        post_items += "<button type='button' class='swiper-button-prev' style='pointer-events: all;'>";
        post_items += "<i class='sk-arrow sk-arrow-left'></i>";
        post_items += "</button>";
        post_items += "<div id='sk_linkedin_recommendation_slider' class='swiper-container swiper-layout-slider'>";
        post_items += "<div class='swiper-wrapper'>";
        var last_index = 0;
        var data_slider = data_storage;
        if (data_slider.length) {
            var column_count = getDsmSetting(sk_linkedin_recommendation, "column_count");
            if (sk_linkedin_recommendation.width() <= 480) {
                column_count = 1;
            } else if (sk_linkedin_recommendation.width() <= 750) {
                column_count = 2;
            }
            sk_linkedin_recommendation.find('div.column_count').text(column_count);
            var profiles = Math.ceil(data_slider.length / column_count);
            for (var slide = 1; slide <= profiles; slide++) {
                post_items += "<div class='swiper-slide' >";
                post_items += "<div class='grid-linkedin-recommendations'>";
                post_items += "<div class='grid-sizer-linkedin-recommendations'></div>";
                var slide_data = getPaginationResult(sk_linkedin_recommendation, data_slider, slide, column_count);
                jQuery.each(slide_data, function (key, val) {
                    if (typeof val != 'undefined') {
                        post_items += "<div class='linkedin_recommendation'>";
                        post_items += getFeedItem(val, sk_linkedin_recommendation);
                        post_items += "</div>";
                    }
                });
                post_items += "</div>";
                post_items += "</div>";
            }
        } else {
            post_items += "<div>No posts yet. Check back later!</div>";
        }
        post_items += "</div>";
        post_items += "</div>";
        return post_items;
    }

    function loadFacebookFeedForSliderLayout(jQuery, sk_linkedin_recommendation) {
        var embed_id = getDsmEmbedId(sk_linkedin_recommendation);
        var json_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
        jQuery.getJSON(json_url, function (data) {
            if (data.show_feed == false) {
                sk_linkedin_recommendation.prepend(data.message);
                sk_linkedin_recommendation.find('.loading-img').hide();
                sk_linkedin_recommendation.find('.first_loading_animation').hide();
            } else if (data.message == "load failed" || data.message == "No Data Found") {
                var sk_error_message = data.instructions;
                sk_linkedin_recommendation.find(".first_loading_animation").hide();
                sk_linkedin_recommendation.html(sk_error_message);
            } else {
                data_storage = data.posts;
                var turnon_preapproval_posts = getDsmSetting(sk_linkedin_recommendation, "turnon_preapproval_posts");
                var predefined_search_keyword = getDsmSetting(sk_linkedin_recommendation, "predefined_search_keyword");
                if (data_storage && data_storage.length > 0) {
                    data_storage = moderationTabFeature(sk_linkedin_recommendation, data_storage, turnon_preapproval_posts);
                    data_storage = orderBy(data_storage, sk_linkedin_recommendation);
                }
                if (predefined_search_keyword) {
                    data_storage = predefinedPostFeature(data_storage, predefined_search_keyword);
                }
                var post_items = "";
                post_items += "<button type='button' class='swiper-button-next ' style='pointer-events: all;'>";
                post_items += "<i class='sk-arrow sk-arrow-right'></i>";
                post_items += "</button>";
                post_items += "<button type='button' class='swiper-button-prev' style='pointer-events: all;'>";
                post_items += "<i class='sk-arrow sk-arrow-left'></i>";
                post_items += "</button>";
                post_items += "<div id='sk_linkedin_recommendation_slider' class='swiper-container swiper-layout-slider'>";
                post_items += "<div class='swiper-wrapper'>";
                var last_index = 0;
                var data_slider = data_storage;
                if (data_slider.length) {
                    var column_count = getDsmSetting(sk_linkedin_recommendation, "column_count");
                    if (sk_linkedin_recommendation.width() <= 480) {
                        column_count = 1;
                    } else if (sk_linkedin_recommendation.width() <= 750) {
                        column_count = 2;
                    }
                    var profiles = Math.ceil(data_slider.length / column_count);
                    for (var slide = 1; slide <= profiles; slide++) {
                        post_items += "<div class='swiper-slide' >";
                        post_items += "<div class='grid-linkedin-recommendations'>";
                        post_items += "<div class='grid-sizer-linkedin-recommendations'></div>";
                        var slide_data = getPaginationResult(sk_linkedin_recommendation, data_slider, slide, column_count);
                        jQuery.each(slide_data, function (key, val) {
                            if (typeof val != 'undefined')
                                post_items += getFeedItem(val, sk_linkedin_recommendation);
                        });
                        post_items += "</div>";
                        post_items += "</div>";
                    }
                } else {
                    post_items += "<div>No posts yet. Check back later!</div>";
                }
                post_items += "</div>";
                post_items += "</div>";
                post_items += skGetBranding(sk_linkedin_recommendation, data.user_info);
                sk_linkedin_recommendation.append(post_items);
                replaceBigFontSize(sk_linkedin_recommendation);
                applyCustomUi(jQuery, sk_linkedin_recommendation);
                applyMasonry();
                skLayoutSliderSetting(sk_linkedin_recommendation);
                skLayoutSliderArrowUI(sk_linkedin_recommendation);
                sk_linkedin_recommendation.find('.post-content').find('a').attr('target', '_blank');
                for (var i = 0; i < jQuery('.sk-post-text').length; i++) {
                    loadMoreTextFeature(sk_linkedin_recommendation, jQuery(jQuery('.sk-post-text')[i]));
                }
                showLinkedinData(data_storage);
                sk_increaseView(data.user_info);
            }
        });
    }

    function getPaginationResult(sk_linkedin_recommendation, post_data, profile, column_count) {
        var start = 0;
        var end = parseInt(column_count);
        var multiplicand = profile - 1;
        var return_post_data = [];
        if (profile != 1) {
            start = multiplicand * end;
            end = start + end;
        }
        if ((end - 1) > post_data.length) {
            end = post_data.length;
        }
        for (var i = start; i < end; i++) {
            return_post_data.push(post_data[i]);
        }
        return return_post_data;
    }

    function skLayoutSliderSetting(sk_linkedin_recommendation) {
        var autoplay = false;
        var loop = false;
        if (getDsmSetting(sk_linkedin_recommendation, "autoplay") == 1) {
            var delay = getDsmSetting(sk_linkedin_recommendation, "delay") * 1500;
            autoplay = {
                delay: delay
            };
        }
        var swiper = new Swiper('.swiper-layout-slider.swiper-container', {
            loop: loop,
            autoplay: autoplay,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    function skLayoutSliderAutoplayHeight(sk_linkedin_recommendation) {
        var thisH = 0;
        var maxHeight = 0;
        var thisHC = 0;
        var maxHeightC = 0;
        var slider_active = sk_linkedin_recommendation.find('.swiper-slide-active');
        var slider_next = sk_linkedin_recommendation.find('.swiper-slide-next');
        var slider_first = sk_linkedin_recommendation.find('div.swiper-slide-1');
        var slider_duplicate = sk_linkedin_recommendation.find('div.swiper-slide-duplicate');
        if (slider_active.length == 0) {
            slider_active = slider_duplicate;
        }
        slider_next = slider_active;
        maxHeight = slider_next.find('.grid-linkedin-recommendations').height() + slider_next.find('.linkedin-recommendations-user-root-container').height();
        slider_next.css({
            "height": maxHeight + "px"
        });
        slider_next.find('.sk_fb_profile_reviews_grid').css({
            "height": maxHeight + "px"
        });
        sk_linkedin_recommendation.find('.swiper-wrapper').css({
            "height": maxHeight + "px"
        });
        var feed_height = sk_linkedin_recommendation.find('#sk_linkedin_recommendation_slider').height();
        var feed_height_2 = feed_height / 2;
        sk_linkedin_recommendation.find(".swiper-button-prev,.swiper-button-next").css({
            "top": feed_height_2 + "px"
        });
        if (sk_linkedin_recommendation.width() < 450) {
            sk_linkedin_recommendation.find(".swiper-button-next").css({
                "right": "8px"
            })
        }
    }

    function hoverContent(sk_linkedin_recommendation) {
        if (jQuery(document).width() < 480) {
            sk_linkedin_recommendation.find(".grid-linkedin-recommendations").find(".post-content").css({
                "overflow-y": "auto",
                "overflow-x": "hidden",
            });
        } else {
            sk_linkedin_recommendation.find(".grid-linkedin-recommendations").find(".post-content").mouseover(function () {
                var container_height = jQuery(this).find(".margin-zero").height();
                if (jQuery(this).height() < container_height) {
                    jQuery(this).css({
                        "overflow-y": "scroll",
                        "overflow-x": "hidden",
                    });
                }
            }).mouseout(function () {
                jQuery(this).css({
                    "overflow-y": "hidden",
                    "overflow-x": "hidden"
                });
            });
            sk_linkedin_recommendation.find(".post-content").css({
                "overflow": "hidden"
            });
        }
        jQuery(".mfp-content").find(".white-popup").find(".post-content").css({
            "overflow": "unset"
        });
    }

    function skLayoutSliderArrowUI(sk_linkedin_recommendation) {
        var post_height = getDsmSetting(sk_linkedin_recommendation, 'post_height');
        if (post_height == 0) {
            post_height = 400;
        }
        if (post_height > 0) {
            sk_linkedin_recommendation.find(".grid-content").find('.post-content').css('height', post_height + 'px');
            hoverContent(sk_linkedin_recommendation);
        } else {
            resizeHeightBasedOnContent(sk_linkedin_recommendation);
        }
        var arrow_background_color = getDsmSetting(sk_linkedin_recommendation, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_linkedin_recommendation, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_linkedin_recommendation, "arrow_opacity");
        sk_linkedin_recommendation.find(".swiper-button-prev i,.swiper-button-next i").mouseover(function () {
            jQuery(this).css({
                "opacity": "1",
                "border-color": arrow_background_color,
            });
        }).mouseout(function () {
            jQuery(this).css({
                "border-color": arrow_color,
                "opacity": arrow_opacity
            });
        });
        sk_linkedin_recommendation.find(".swiper-button-prev i,.swiper-button-next i").css({
            "border-color": arrow_color,
            "opacity": arrow_opacity,
            "color": arrow_color
        });
        sk_linkedin_recommendation.find(".swiper-button-spinner").css({
            "color": arrow_color
        });
        skLayoutSliderAutoplayHeight(sk_linkedin_recommendation);
    }

    function showPopUp(jQuery, content_src, clicked_element, sk_linkedin_recommendation) {
        jQuery('.sk_selected_recommendation').removeClass('sk_selected_recommendation');
        clicked_element.addClass('sk_selected_recommendation');
        if (typeof jQuery.magnificPopup === "undefined")
            initManificPopupPlugin(jQuery);
        jQuery.magnificPopup.open({
            items: {
                src: content_src
            },
            'type': 'inline',
            callbacks: {
                open: function () {
                    if (sk_linkedin_recommendation) {
                        applyPopUpColors(sk_linkedin_recommendation);
                    }
                    if (jQuery('.mfp-content').find('.more').length > 0) {
                        jQuery('.mfp-content').find('.more')[0].click();
                    }
                    var post_items = "";
                    if (clicked_element.prev('.linkedin_recommendation').length > 0) {
                        post_items += "<button class='prev_recommendation'>";
                        post_items += "<i class='fa fa-chevron-left sk_prt_4px' aria-hidden='true'></i>";
                        post_items += "</button>";
                    }
                    if (clicked_element.next('.linkedin_recommendation').length > 0) {
                        post_items += "<button class='next_recommendation'>";
                        post_items += "<i class='fa fa-chevron-right sk_plt_4px' aria-hidden='true'></i>";
                        post_items += "</button>";
                    }
                    $('.mfp-content').prepend(post_items)
                    if (jQuery('.mfp-content').find(".sk_post_media ").html() == "") {
                        jQuery('.mfp-content').find(".sk_post_media").hide();
                        jQuery('.mfp-content').find(".sk-popup-post-content").css('width', '100%');
                        jQuery('.mfp-content').find(".post-header").css('padding', '0px');
                        jQuery('.mfp-content').find(".sk-popup-post-content-details").css('padding', '20px');
                        var height = jQuery('.mfp-content').find('.sk-popup-post-content').height();
                        jQuery('.mfp-content').find('.sk-popup-container').height(height);
                        return;
                    }
                    var pop_up_bg_color = getDsmSetting(sk_linkedin_recommendation, "pop_up_bg_color");
                    var pop_up_font_color = getDsmSetting(sk_linkedin_recommendation, "pop_up_font_color");
                    if (jQuery('.mfp-content  video').get(0) !== undefined) {
                        jQuery('.mfp-content  video').get(0).play();
                        if (sk_linkedin_recommendation.width() > 480) {
                            adjustPopUpWhenVid();
                        }
                    }
                    if (jQuery(document).width() >= 500) {
                        popUpDesktopView(sk_linkedin_recommendation);
                    } else {
                        jQuery('.mfp-content').find('.multiple_photos').css({
                            "display": "block"
                        });
                        jQuery('.mfp-content').find('.sk_post_img-popup-hidden').css({
                            "display": "none"
                        });
                        jQuery('.mfp-content').find('.href_status_trigger_post_container , .post-header, .post-post-counts').css({
                            "padding": "20px"
                        });
                    }
                    jQuery('.mfp-content').find('a.sk_show_less').remove();
                    jQuery('.mfp-content').find('.sk_video_holder img.sk_post_img').remove();
                    jQuery('.mfp-content').find('video.sk_post_img').show();
                    jQuery('.mfp-content').css({
                        'font-family': ("'Open Sans', sans-serif")
                    });
                    jQuery('.mfp-content').find(".sk-linkedin-recommendations-shared-info").css('margin-top', '0px');
                    jQuery('.mfp-content').find(".sk-linkedin-recommendations-shared-info .sk_post_media").css('padding', '0px');
                    jQuery('.mfp-content').find(".sk-linkedin-recommendations-shared-info .post-header").hide();
                    jQuery('.mfp-content').find(".sk-linkedin-recommendations-shared-info .sk-post-text").hide();
                    jQuery('.mfp-content').find(".sk-linkedin-recommendations-shared-info .sk-post-text-new").hide();
                    setTimeout(function () {
                        initializeSwiperSingleSLider(clicked_element);
                    }, 100);
                    jQuery(".mfp-content").find(".white-popup").find(".post-content").find(".margin-zero").css({
                        "width": "auto"
                    });
                    applyCustomUi(jQuery, sk_linkedin_recommendation);
                    if (sk_linkedin_recommendation.width() < 480) {
                        jQuery('.mfp-content').find('.post-post-counts').css({
                            'position': 'relative'
                        });
                        if (jQuery('.mfp-content').find('.multiple_photos').length > 0 || jQuery('.mfp-content').find('video').length > 0) {
                            jQuery('.mfp-content').find('.post-content').css({
                                "height": "auto"
                            });
                        } else {
                            var H = jQuery('.mfp-content').find('.margin-zero').height();
                            jQuery('.mfp-content').find('.post-content').height(H);
                        }
                        if (jQuery('.mfp-content  video').get(0) !== undefined) {
                            jQuery('.mfp-content').find('.post-post-counts').css({
                                'position': 'relative',
                                'bottom': '-15px'
                            });
                        }
                    } else {
                        jQuery('.mfp-content').find('.post-post-counts').css('visibility', 'hidden')
                        var H = jQuery('.mfp-content').height();
                        jQuery('.mfp-content').find('.white-popup').height(H);
                        jQuery('.mfp-content').find('.post-content').height(H);
                        var Foot = jQuery('.mfp-content').find('.post-post-counts').height();
                        setTimeout(function () {
                            var H = jQuery('.mfp-content').find('.white-popup').height();
                            var Head = jQuery('.mfp-content').find('.post-header').height();
                            if (!Foot) {
                                Foot = 0;
                            }
                            if (!Head) {
                                Head = 0;
                            }
                            var footer = 50;
                            var Final = H - Head - Foot;
                            jQuery('.mfp-content').find('.sk-post-text').height(Final - footer);
                            jQuery('.mfp-content').find('.post-post-counts').css('bottom', '0px')
                            jQuery('.mfp-content').find('.post-post-counts').css('top', 'unset')
                            jQuery('.mfp-content').find('.post-post-counts').css('visibility', 'visible');
                        }, 300);
                    }
                    jQuery(".mfp-content").find(".sk-post-repost-count, .sk-post-favorite-count,.sk-secondary-data,.sk-post-description").css({
                        "color": pop_up_font_color
                    });
                    jQuery('.mfp-content').find(".mfp-close").remove();
                    jQuery('.mfp-content').prepend('<button title="Close (Esc)" type="button" class="mfp-close" style="right: 0px;">Ã—</button>');
                    jQuery('.mfp-content').find(".mfp-close").css({
                        "right": parseInt(jQuery('.mfp-content').find(".white-popup").css("marginRight")) - 8 + "px"
                    });
                    setLineHeight(sk_linkedin_recommendation);
                },
                close: function () {
                    jQuery('video').each(function () {
                        jQuery(this)[0].pause();
                    });
                }
            }
        });
    }

    function initializeSwiperSingleSLider(clicked_element) {
        var singleSwiper = new Swiper('.swiper-container-single', {
            slidesPerView: 1,
            spaceBetween: 30,
            effect: 'fade',
            autoplay: 3000,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next-single',
                prevEl: '.swiper-button-prev-single',
            },
        });
        jQuery('.swiper-container-single .swiper-button-next-single,.swiper-container-single .swiper-button-prev-single').css({
            'top': "50%",
            'width': "35px",
            'height': "35px",
            'background-image': "none",
            'background-color': "transparent",
            'color': 'white',
            'text-align': 'center',
            'opacity': '0.7',
            'border-radius': '50%',
        });
        var h = jQuery('.swiper-container-single .swiper-slide-active img,.swiper-container-single .swiper-slide-active video').innerHeight();
        jQuery('.swiper-container-single').css('height', h + 'px');
        jQuery('.swiper-container-single .swiper-slide-active').css("width", "100%");
        jQuery('.swiper-layout-slider .swiper-slide-active').css('width', '100%');
        if (jQuery(document).width() > 480 && jQuery('.mfp-content .swiper-container-single').length > 0) {
            jQuery('.white-popup .sk-post-text').css('height', h - 110 + 'px');
            jQuery('.white-popup .post-post-counts').css('top', h - 25 + 'px');
            jQuery(".mfp-content .swiper-button-next-single, .mfp-content .swiper-button-prev-single").on("click", function () {
                jQuery(".mfp-content, .mfp-content .white-popup,.mfp-content .post-content,.mfp-content .swiper-container").css({
                    "height": jQuery(".mfp-content").find(".swiper-slide-active").find("img").height() + "px"
                });
            });
        } else if (jQuery(document).width() <= 480 && jQuery('.mfp-content .swiper-container-single').length > 0) {
            jQuery(".mfp-content .swiper-button-next-single, .mfp-content .swiper-button-prev-single").on("click", function () {
                jQuery(".mfp-content .swiper-container").css({
                    "height": jQuery(".mfp-content").find(".swiper-slide-active").find("img").height() + "px"
                });
            });
        }
    }

    function popUpDesktopView(sk_linkedin_recommendation) {
        var sk_post_media = jQuery('.mfp-content').find('.sk_post_media');
        var post_media_width = "calc(60% - 20px)";
        var post_media_width = "60%";
        sk_post_media.css({
            "width": post_media_width,
            "float": "left"
        });
        jQuery('.mfp-content').find('.sk-popup-post-content').css({
            "width": "40%",
            "float": "right",
            "right": "0px",
        });
        jQuery('.mfp-content').find('.sk-popup-post-content-details').css({
            "padding": "20px"
        });
        var header = jQuery('.mfp-content').find('.post-header');
        var description_container = jQuery('.mfp-content').find('.href_status_trigger_post_container');
        var description_position = 0;
        if (header.length > 0) {
            description_position = header[0].offsetHeight;
        }
        description_container.css({
            "top": description_position + 10 + "px"
        });
        setTimeout(function () {
            var post_image_height = jQuery('.mfp-content').find('.sk_post_img')[0].offsetHeight;
            if (jQuery('.mfp-content').find('.multiple_photos').length > 0)
                post_image_height = jQuery('.mfp-content').find('.multiple_photos').find('.sk_post_img')[0].height;
            var active_slide = jQuery('.mfp-content').find('.swiper-slide-active');
            description_container.css({
                "height": "auto"
            });
            if (active_slide.length > 1 && (description_position + description_container[0].offsetHeight) + 15 > post_image_height && post_image_height > 0) {
                var height = (jQuery('.mfp-content').find('.sk_post_img')[0].offsetHeight / 2 - 15);
                description_container.css({
                    "height": height + "px",
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                });
            } else if (active_slide.length > 0) {
                if ((description_position + description_container[0].offsetHeight) + 15 > active_slide[0].offsetHeight) {
                    var height = "";
                    if (active_slide.length > 0)
                        height = (active_slide[0].offsetHeight);
                    description_container.css({
                        "height": height + "px",
                        "overflow-y": "auto",
                        "overflow-x": "hidden"
                    });
                }
            } else {
                var height = (jQuery('.mfp-content').find('.sk_post_img')[0].offsetHeight);
                if (header.length > 0) {
                    height = height - header[0].offsetHeight - 60;
                }
                description_container.css({
                    "height": height + "px",
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                });
            }
            jQuery('.mfp-content').find('.multiple_photos').css({
                "display": "block"
            });
            jQuery('.mfp-content').find('.sk_post_img-popup-hidden').css({
                "display": "none"
            });
            var item_height = jQuery('.mfp-content').find('.sk_post_img')[0].offsetHeight;
            if (jQuery('.mfp-content').find('.multiple_photos').length > 0)
                item_height = jQuery('.mfp-content').find('.multiple_photos').find('.sk_post_img')[0].height;
            var post_count_position = 0;
            if (header.length > 0) {
                post_count_position = header[0].offsetHeight;
            }
            if (description_container.length > 0) {
                post_count_position = post_count_position + description_container[0].offsetHeight;
            }
            jQuery(".white-popup").css({
                "height": item_height
            });
            jQuery(".mfp-content").css({
                "height": item_height + "px"
            });
            if (jQuery('.white-popup').height() < 200) {
                jQuery(".white-popup, .sk_post_media").css({
                    "height": "200px"
                });
                jQuery('.white-popup').find(".sk_post_media").css({
                    "background-color": "black"
                });
                var img_margin_top = (200 - jQuery(".sk_post_img ").height()) / 2;
                jQuery('.white-popup').find(".sk_post_img ").css({
                    "margin-top": img_margin_top + "px"
                });
            }
        }, 50);
    }
    var adjustPopUpWhenVid = function () {
        var i = 0;
        while (i < 500) {
            (function (i) {
                setTimeout(function () {
                    if (jQuery('.mfp-content  video').length > 0) {
                        jQuery(".white-popup, .mfp-content").css({
                            "height": jQuery('.mfp-content  video')[0].clientHeight
                        });
                    }
                }, 200 * i)
            })(i++)
        }
    };

    function setLineHeight(sk_linkedin_recommendation) {
        sk_linkedin_recommendation.find('.sk-popup-container .feed-shared-text').css({
            'line-height': '1.6'
        });
    }

    function makeResponsive(jQuery, sk_linkedin_recommendation) {
        var sk_linkedin_recommendation_width = sk_linkedin_recommendation.width();
        var grid_sizer_item = 25;
        if (sk_linkedin_recommendation_width <= 320) {
            grid_sizer_item = 100;
        } else if (sk_linkedin_recommendation_width <= 481) {
            grid_sizer_item = 100;
        } else if (sk_linkedin_recommendation_width <= 641) {
            if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 1) {
                grid_sizer_item = 100;
            } else {
                grid_sizer_item = 50;
            }
        } else if (sk_linkedin_recommendation_width <= 930) {
            if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 2) {
                grid_sizer_item = 50;
            } else if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 3) {
                grid_sizer_item = 33.3;
            } else {
                grid_sizer_item = 25
            }
        } else {
            if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 2) {
                grid_sizer_item = 50;
            } else if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 3) {
                grid_sizer_item = 33;
            } else if (getDsmSetting(sk_linkedin_recommendation, "column_count") == 4) {
                grid_sizer_item = 25;
            }
        }
        if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 4) {
            grid_sizer_item = 100;
        }
        jQuery("body .grid-sizer-linkedin-recommendations, body .grid-item-linkedin-recommendations").css({
            "width": grid_sizer_item + "%"
        });
        if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 1 || getDsmSetting(sk_linkedin_recommendation, 'layout') == 3) {
            var imgs = sk_linkedin_recommendation.find('img');
            var len = imgs.length;
            if (len == 0 || imgs.prop('complete')) {
                setTimeout(function () {
                    setFeedHeight(sk_linkedin_recommendation);
                }, 100);
            }
            var counter = 0;
            [].forEach.call(imgs, function (img) {
                img.addEventListener('load', function () {
                    counter++;
                    if (counter == len || counter == len + 1 || counter >= len) {
                        setTimeout(function () {
                            setFeedHeight(sk_linkedin_recommendation);
                        }, 100);
                    }
                }, false);
            });
        }
    }

    function setFeedHeight(sk_linkedin_recommendation) {
        if (sk_linkedin_recommendation.find('.grid-item-linkedin-recommendations').length < 1) {
            return;
        }
        if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 1 || getDsmSetting(sk_linkedin_recommendation, 'layout') == 3) {
            var imgs = sk_linkedin_recommendation.find('img');
            var len = imgs.length;
            if (len == 0 || imgs.prop('complete')) {
                setTimeout(function () {
                    setPostsHeight(sk_linkedin_recommendation);
                }, 500);
            }
            var counter = 0;
            [].forEach.call(imgs, function (img) {
                img.addEventListener('load', function () {
                    counter++;
                    if (counter == len || counter == len + 1 || counter >= len) {
                        setTimeout(function () {
                            setPostsHeight(sk_linkedin_recommendation);
                        }, 500);
                    }
                }, false);
            });
        }
        if (getDsmSetting(sk_linkedin_recommendation, 'layout') == 3) {
            setTimeout(function () {
                skLayoutSliderAutoplayHeight(sk_linkedin_recommendation);
            }, 600)
        }
    }

    function setPostsHeight(sk_linkedin_recommendation) {
        var height_max = parseInt(getDsmSetting(sk_linkedin_recommendation, 'post_height'));
        if (height_max > 0) {
            var post_contents = sk_linkedin_recommendation.find(".grid-content");
            for (var i = 0; i < post_contents.length; i++) {
                var header_element = jQuery(post_contents[i]).find(".post-header");
                if (header_element.length > 0) {
                    var header_height = header_element.height();
                    var new_height = height_max - header_height - getDsmSetting(sk_linkedin_recommendation, "item_content_padding") - 65;
                    if (new_height > 0) {
                        sk_linkedin_recommendation.find(".grid-content").css('height', height_max + 'px');
                        jQuery(sk_linkedin_recommendation.find(".post-content")[i]).css('height', (new_height) + 'px');
                        hoverContent(sk_linkedin_recommendation);
                    } else {
                        resizeHeightBasedOnContent(sk_linkedin_recommendation);
                    }
                }
            }
            hoverContent(sk_linkedin_recommendation);
        } else {
            resizeHeightBasedOnContent(sk_linkedin_recommendation);
        }
        sk_linkedin_recommendation.find(".grid-content").find(".margin-zero").css({
            "width": sk_linkedin_recommendation.find(".post-content").width() - 10 + "px"
        });
        applyMasonry();
        fixMasonry();
    }

    function resize_iFrame() {
        var img_width = jQuery('.mfp-content .sk_media_content img').width()
        var img_height = jQuery('.mfp-content .sk_media_content img').height()
        jQuery('.mfp-content .sk_media_content iframe').width(img_width)
        jQuery('.mfp-content .sk_media_content iframe').height(img_height)
    }

    function resizeHeightBasedOnContent(sk_linkedin_recommendation) {
        for (var i = 0; i <= 10; i++) {
            setTimeout(function () {
                makeResponsive(jQuery, sk_linkedin_recommendation);
            }, i * 1000);
        }
    }

    function applyCustomUi(jQuery, sk_linkedin_recommendation) {
        sk_linkedin_recommendation.find(".loading-img").hide();
        var sk_linkedin_recommendation_width = sk_linkedin_recommendation.find('.sk_linkedin_recommendation_width').text();
        sk_linkedin_recommendation.css({
            'width': '100%'
        });
        var sk_linkedin_recommendation_width = sk_linkedin_recommendation.innerWidth();
        sk_linkedin_recommendation.css({
            'height': 'auto'
        });
        var column_count = sk_linkedin_recommendation.find('.column_count').text();
        var border_size = 0;
        var background_color = "#555555";
        var space_between_images = sk_linkedin_recommendation.find('.space_between_images').text();
        var margin_between_images = parseFloat(space_between_images).toFixed(2) / 2;
        var total_space_between_images = parseFloat(space_between_images).toFixed(2) * parseFloat(column_count);
        var pic_width = (parseFloat(sk_linkedin_recommendation_width).toFixed(2) - parseFloat(total_space_between_images).toFixed(2)) / parseFloat(column_count).toFixed(2);
        var sk_ig_all_posts_minus_spaces = parseFloat(sk_linkedin_recommendation_width).toFixed(2) - parseFloat(total_space_between_images).toFixed(2);
        var bottom_button_container_width = parseFloat(sk_linkedin_recommendation_width).toFixed(2) - (parseFloat(space_between_images).toFixed(2) * 2);
        var bottom_button_width = parseFloat(sk_linkedin_recommendation_width).toFixed(2) / parseFloat(2).toFixed(2);
        var sk_linkedin_recommendation_width_minus_space_between_images = parseFloat(sk_linkedin_recommendation_width).toFixed(2) - parseFloat(space_between_images).toFixed(2);
        sk_linkedin_recommendation.css({
            'font-family': ("'Open Sans', sans-serif"),
            'width': sk_linkedin_recommendation_width_minus_space_between_images,
            'background-color': getDsmSetting(sk_linkedin_recommendation, "widget_bg_color"),
            'color': getDsmSetting(sk_linkedin_recommendation, "widget_font_color")
        });
        var arrow_background_color = getDsmSetting(sk_linkedin_recommendation, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_linkedin_recommendation, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_linkedin_recommendation, "arrow_opacity");
        jQuery('.sk-pop-ig-post').css({
            'font-family': ("'Open Sans', sans-serif")
        });
        sk_linkedin_recommendation.find('.sk-article-link, .sk-post-text, .sk_post_name, .sk_post_media, .sk_post_media a, .post-post-counts, .sk_link_meta').css({
            'color': getDsmSetting(sk_linkedin_recommendation, "details_font_color")
        });
        sk_linkedin_recommendation.find('.grid-content').css({
            'background-color': getDsmSetting(sk_linkedin_recommendation, "details_bg_color")
        });
        sk_linkedin_recommendation.find('.sk-secondary-data').css({
            'color': getDsmSetting(sk_linkedin_recommendation, "details_secondary_font_color"),
            'font-family': ("'Open Sans', sans-serif")
        });
        sk_linkedin_recommendation.find('.sk-fb-profile-name').css({
            'font-family': ("'Open Sans', sans-serif")
        });
        sk_linkedin_recommendation.find('.sk-popup-post-content-details').css({
            'font-family': ("'Open Sans', sans-serif")
        });
        sk_linkedin_recommendation.find('.sk-fb-profile-name a').css({
            'font-size': getDsmSetting(sk_linkedin_recommendation, "title_font_size")
        });
        sk_linkedin_recommendation.find('.sk-ww-linkedin-recommendations-item').css({
            'color': getDsmSetting(sk_linkedin_recommendation, "details_font_color"),
            'border-top': 'thin solid ' + getDsmSetting(sk_linkedin_recommendation, "post_separator_color")
        });
        if (getDsmSetting(sk_linkedin_recommendation, 'show_post_date') == 0) {
            sk_linkedin_recommendation.find('.sk-fb-profile-name').css({
                'margin-top': '12px'
            });
        }
        var margin_bottom_sk_ig_load_more_posts = space_between_images;
        if (margin_bottom_sk_ig_load_more_posts == 0) {
            margin_bottom_sk_ig_load_more_posts = 5;
        }
        sk_linkedin_recommendation.find(".sk-linkedin-recommendations-load-more-posts").css({
            'margin-bottom': margin_bottom_sk_ig_load_more_posts + 'px'
        });
        sk_linkedin_recommendation.find(".linkedin-recommendations-user-container, .sk-linkedin-recommendations-load-more-posts, .sk-linkedin-recommendations-bottom-follow-btn").css({
            'background-color': getDsmSetting(sk_linkedin_recommendation, "button_bg_color"),
            'border-color': getDsmSetting(sk_linkedin_recommendation, "button_bg_color"),
            'color': getDsmSetting(sk_linkedin_recommendation, "button_text_color")
        });
        if (getDsmSetting(sk_linkedin_recommendation, "show_box_shadow") == 1) {
            sk_linkedin_recommendation.find('.grid-content').css({
                'box-shadow': "0 2px 5px 0 rgba(0,0,0,0.10)",
                '-moz-box-shadow': "0 2px 5px 0 rgba(0,0,0,0.10)",
                '-webkit-box-shadow': "0 2px 5px 0 rgba(0,0,0,0.10)",
            });
        }
        sk_linkedin_recommendation.find('.grid-content').css('border-radius', getDsmSetting(sk_linkedin_recommendation, 'item_border_radius') + 'px');
        sk_linkedin_recommendation.find('.sk-linkedin-recommendations-shared-info .sk_post_media').css({
            'padding': "5px"
        });
        sk_linkedin_recommendation.find(".linkedin-recommendations-user-container, .sk-linkedin-recommendations-load-more-posts, .sk-linkedin-recommendations-bottom-follow-btn").mouseover(function () {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_linkedin_recommendation, "button_hover_bg_color"),
                'border-color': getDsmSetting(sk_linkedin_recommendation, "button_hover_bg_color"),
                'color': getDsmSetting(sk_linkedin_recommendation, "button_hover_text_color")
            });
        }).mouseout(function () {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_linkedin_recommendation, "button_bg_color"),
                'border-color': getDsmSetting(sk_linkedin_recommendation, "button_bg_color"),
                'color': getDsmSetting(sk_linkedin_recommendation, "button_text_color")
            });
        });
        var padding_sk_ig_bottom_btn_container = margin_between_images;
        if (padding_sk_ig_bottom_btn_container == 0) {
            padding_sk_ig_bottom_btn_container = 5;
        }
        sk_linkedin_recommendation.find(".sk-linkedin-recommendations-bottom-btn-container").css({
            'padding': padding_sk_ig_bottom_btn_container + 'px'
        });
        sk_linkedin_recommendation.find('.sk-linkedin-recommendations-profile-description strong').css({
            'color': getDsmSetting(sk_linkedin_recommendation, "widget_font_color")
        });
        fixedMultipleImageHeight(sk_linkedin_recommendation, pic_width);
        applyDsmDetailsLinkColor(sk_linkedin_recommendation);
        applyDsmDetailsLinkHoverColor(sk_linkedin_recommendation);
        applyDsmPostContentPadding(sk_linkedin_recommendation);
        applyDsmTitleAllCapitalization(sk_linkedin_recommendation);
        applyDsmDefaultFonts(sk_linkedin_recommendation);
        applyDsmPictureShape(sk_linkedin_recommendation);
        applyDsmFontFamily(sk_linkedin_recommendation);
        applyGridImageLayout(sk_linkedin_recommendation);
        jQuery('.sk_powered_by a').css({
            'background-color': getDsmSetting(sk_linkedin_recommendation, "details_bg_color"),
            'color': getDsmSetting(sk_linkedin_recommendation, "details_font_color"),
            'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size"),
        });
        sk_linkedin_recommendation.find('.sk-fb-event-item, .sk_powered_by').css({
            'margin-bottom': getDsmSetting(sk_linkedin_recommendation, "space_between_events") + 'px'
        });
        if (jQuery('.mfp-content').length == 0)
            makeResponsive(jQuery, sk_linkedin_recommendation);
        resize_iFrame();
        if (getDsmSetting(sk_linkedin_recommendation, "layout") == 3 && jQuery('.mfp-content').length == 0) {
            skLayoutSliderArrowUI(sk_linkedin_recommendation);
            sk_linkedin_recommendation.find(".linkedin-recommendations-user-root-container, .sk-recommendation-type-main-container").css({
                "width": "88%",
                "margin": "0 auto"
            });
        }
        jQuery('head').append('<style type="text/css">' + getDsmSetting(sk_linkedin_recommendation, "custom_css") + '</style>');
        applyLinksClickableOption(sk_linkedin_recommendation);
        sk_linkedin_recommendation.find('.sk-linkedin-recommendations-profile-usename a').css({
            'color': getDsmSetting(sk_linkedin_recommendation, "profile_name_color")
        });
        if (getDsmSetting(sk_linkedin_recommendation, "layout") == 3) {
            sk_linkedin_recommendation.find('.grid-linkedin-recommendations').css({
                "width": "100%",
                "margin": "0 auto"
            });
            sk_linkedin_recommendation.find('.sk-linkedin-recommendations-profile-info').css({
                "width": "auto"
            });
        }
        if (jQuery(document).width() <= 380) {
            sk_linkedin_recommendation.find(".sk-linkedin-recommendations-shared-info").find(".post-image").css({
                "margin-right": "5px"
            });
            sk_linkedin_recommendation.find(".sk-linkedin-recommendations-shared-info").find(".post-image").find("img").css({
                "width": "45px"
            });
            sk_linkedin_recommendation.find(".sk-linkedin-recommendations-shared-info").find(".sk-fb-profile-name").css({
                "font-size": "12px"
            });
        }
        var profile_image_container = sk_linkedin_recommendation.find(".sk-linkedin-recommendations-shared-info").find(".post-image");
        var profile_image_container_size = profile_image_container.length > 0 ? profile_image_container.css("marginRight").replace("px", "") : 10;
        if (jQuery(document).width() > 780) {
            var new_owner_description_size = profile_image_container.width() + parseInt(profile_image_container_size);
            sk_linkedin_recommendation.find(".sk-linkedin-shared-post-owner-description").css({
                "margin-left": new_owner_description_size + "px"
            });
        }
        if (window.location.href.indexOf("annaravazza.it")) {
            var metaViewport = document.createElement('meta');
            metaViewport.setAttribute('name', 'viewport');
            metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
            if (document.getElementsByTagName('head') != null) {
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(metaViewport);
            }
        }
        sk_linkedin_recommendation.find(".sk_meta_holder_description .feed-shared-article__title").css({
            'font-weight': '100'
        })
    }

    function applyDsmDetailsLinkColor(sk_linkedin_recommendation) {
        sk_linkedin_recommendation.find(".grid-content a").css({
            'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
        });
    }

    function applyDsmDetailsLinkHoverColor(sk_linkedin_recommendation) {
        if (getDsmSetting(sk_linkedin_recommendation, "links_clickable") == 1) {
            sk_linkedin_recommendation.find(".grid-content a").hover(function () {
                jQuery(this).css({
                    'color': getDsmSetting(sk_linkedin_recommendation, "details_link_hover_color")
                });
            }, function () {
                jQuery(this).css({
                    'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
                });
            });
        }
    }

    function applyDsmPostContentPadding(sk_linkedin_recommendation) {
        sk_linkedin_recommendation.find(".grid-content").css({
            'padding': getDsmSetting(sk_linkedin_recommendation, "item_content_padding") + "px"
        });
    }

    function applyDsmTitleAllCapitalization(sk_linkedin_recommendation) {
        var element = sk_linkedin_recommendation.find(".sk-linkedin-recommendations-profile-usename");
        if (getDsmSetting(sk_linkedin_recommendation, "title_all_caps") == 1) {
            element.css({
                'text-transform': 'uppercase',
                'font-size': getDsmSetting(sk_linkedin_recommendation, "title_font_size") + 'px'
            });
        } else {
            element.css({
                'font-size': getDsmSetting(sk_linkedin_recommendation, "title_font_size") + 'px'
            });
        }
    }

    function applyDsmDefaultFonts(sk_linkedin_recommendation) {
        var element = sk_linkedin_recommendation.find(".grid-content,.sk-linkedin-recommendations-profile-counts,.sk-linkedin-recommendations-profile-description,.sk-linkedin-recommendations-profile-info button,.sk-linkedin-recommendations-load-more-posts,.sk-linkedin-recommendations-bottom-follow-btn");
        if (getDsmSetting(sk_linkedin_recommendation, "details_all_caps") == 1) {
            element.css({
                'text-transform': 'uppercase',
                'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size") + 'px'
            });
        } else {
            element.css({
                'font-size': getDsmSetting(sk_linkedin_recommendation, "details_font_size") + 'px'
            });
        }
    }

    function applyDsmPictureShape(sk_linkedin_recommendation) {
        sk_linkedin_recommendation.find(".linkedin-recommendations-profile-pic,.img-thumbnail").css({
            'webkit-border-radius': '50%',
            '-moz-border-radius': '50%',
            'border-radius': '50%'
        });
        sk_linkedin_recommendation.find(".post-image .img-thumbnail").css({
            'height': '50px',
            'width': '50px'
        });
        sk_linkedin_recommendation.find('.sk-linkedin-recommendations-shared-info .img-thumbnail').css({
            'width': "40px",
            'height': "40px"
        });
    }

    function applyDsmFontFamily(sk_linkedin_recommendation) {
        var font = ("'Open Sans', sans-serif");
        var splited_string_font = font.split(':');
        sk_linkedin_recommendation.css({
            'font-family':  splited_string_font[0],
        });
    }

    function applyGridImageLayout(sk_linkedin_recommendation) {
        var max_photo = sk_linkedin_recommendation.find('.max_photo');
        if (max_photo.length > 0) {
            jQuery.each(max_photo, function (i, v) {
                jQuery(v).find('div:eq(0)').css({
                    "grid-column": "1 ",
                    "height": "100%",
                    "grid-row": "1/ 1 1"
                });
                jQuery(v).find('div:eq(0) img').css({
                    "height": "auto !important",
                });
            });
            jQuery('.img-count').closest('div.image-item').css({
                "position": "relative",
                "display": "inline-block"
            });
        }
    }

    function applyPopUpColors(popup_container) {
        var pop_up_bg_color = popup_container.find('.pop_up_bg_color').text();
        var pop_up_font_color = popup_container.find('.pop_up_font_color').text();
        var pop_up_link_color = popup_container.find('.pop_up_link_color').text();
        jQuery('.white-popup, .mfp-content .sk-post-text, .mfp-content .sk-secondary-data').css({
            'color': pop_up_font_color,
            'background': pop_up_bg_color
        });
        jQuery('.white-popup').css({
            'color': pop_up_font_color
        });
        jQuery('.mfp-content a,.white-popup a').css({
            'color': pop_up_link_color
        });
    }

    function fixedMultipleImageHeight(sk_linkedin_recommendation, pic_width) {
        if (pic_width > 550) {
            jQuery('.image-item img').css('height', '300px')
            jQuery('.image-item img').css('max-height', '300px')
        } else {
            if (getDsmSetting(sk_linkedin_recommendation, 'column_count') == 1) {
                jQuery('.image-item img').css('height', '100%')
            } else {
                jQuery('.image-item img').css('height', '126px')
            }
        }
        jQuery('.image-item img').css('height', '100%')
    }

    function applyLinksClickableOption(sk_linkedin_recommendation) {
        if (getDsmSetting(sk_linkedin_recommendation, "links_clickable") == 1) {
            sk_linkedin_recommendation.find("a").css({
                'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
            });
            sk_linkedin_recommendation.find("a").find('a').css({
                'color': getDsmSetting(sk_linkedin_recommendation, "details_link_color")
            });
        } else {
            sk_linkedin_recommendation.find("a").not(".sk_readmore_btn").removeAttr("href");
        }
    }

    function loadGoogleFont(font_family) {
        var web_safe_fonts = [
  "Inherit",
  "Impact, Charcoal, sans-serif",
  "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  "'Open Sans', sans-serif", // Added Open Sans here
  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
  "Verdana, Geneva, sans-serif",
  "Copperplate, 'Copperplate Gothic Light', fantasy",
  "'Courier New', Courier, monospace",
  "Georgia, Serif"
];
        if (!web_safe_fonts.includes(font_family)) {
            loadCssFile("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");
        }
    }

    function addDescriptiveTagAttributes(_sk, add_to_img = true) {
        _sk.find('a').each(function (i, v) {
            var title = jQuery(v).text();
            jQuery(v).attr('title', title);
        });
        if (add_to_img) {
            _sk.find('img').each(function (i, v) {
                var src = jQuery(v).attr('src');
                jQuery(v).attr('alt', 'Post image');
            });
        }
    }

    function getClientId() {
        var _gaCookie = document.cookie.match(/(^|[;,]\s?)_ga=([^;,]*)/);
        if (_gaCookie) return _gaCookie[2].match(/\d+\.\d+$/)[0];
    }

    function getSkEmbedId(sk_class) {
        var embed_id = sk_class.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_class.attr('data-embed-id');
        }
        return embed_id;
    }

    function getSkSetting(sk_class, key) {
        return sk_class.find("div." + key).text();
    }

    function setCookieSameSite() {
        document.cookie = "AC-C=ac-c;expires=Fri, 31 Dec 2025 23:59:59 GMT;path=/;HttpOnly;SameSite=Lax";
    }
    setCookieSameSite();

    function getIEVersion() {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");
        if (Idx > 0)
            return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
        else if (!!navigator.userAgent.match(/Trident\/7\./))
            return 11;
        else
            return 0;
    }

    function isSafariBrowser() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    if (getIEVersion() > 0 || isSafariBrowser() > 0) {
        loadIEScript('https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.min.js');
        loadIEScript('https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.js');
    }

    function loadIEScript(url) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }

    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
    }

    function sk_increaseView(user_info) {
        try {
            if (!user_info)
                return;
            jQuery.getJSON('https://api.ipify.org?format=json', function (data) {
                jQuery.getJSON('https://api.ipify.org?format=json', function (data) {
                    var update_views_url = "https://views.accentapi.com/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                    if (app_url.includes("local") && sk_app_url) {
                        update_views_url = "https://localtesting.com/accentapiviews/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                    }
                    jQuery.ajax(update_views_url);
                });
            });
        } catch (err) {
            console.log("Error retrieving ip address.");
        }
    }

    function isTooDarkColor(hexcolor) {
        var r = parseInt(hexcolor.substr(1, 2), 16);
        var g = parseInt(hexcolor.substr(3, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        if (hexcolor.indexOf('rgb') != -1) {
            let rgbstr = hexcolor;
            let v = getRGB(rgbstr);
            r = v[0];
            g = v[1];
            b = v[2];
        }
        b = isNaN(b) ? 0 : b;
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        if (yiq < 60) {} else {}
        return yiq < 60 ? true : false;
    }

    function linkify(html) {
        var temp_text = html.split("https://www.").join("https://");
        temp_text = temp_text.split("www.").join("https://www.");
        var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return temp_text.replace(exp, function () {
            return arguments[1] ? arguments[0] : "<a href=\"" + arguments[3] + "\">" + arguments[3] + "</a>"
        });
    }

    function skGetEnvironmentUrls(folder_name) {
        var scripts = document.getElementsByTagName("script");
        var scripts_length = scripts.length;
        var search_result = -1;
        var other_result = -1;
        var app_url = "https://widgets.sociablekit.com/";
        var app_backend_url = "https://api.accentapi.com/v1/";
        var app_file_server_url = "https://data.accentapi.com/feed/";
        var sk_app_url = "https://sociablekit.com/app/";
        var sk_api_url = "https://api.sociablekit.com/";
        var sk_img_url = "https://images.sociablekit.com/";
        for (var i = 0; i < scripts_length; i++) {
            var src_str = scripts[i].getAttribute('src');
            if (src_str != null) {
                var other_folder = "";
                if (folder_name == 'facebook-page-playlist') {
                    other_folder = 'facebook-page-playlists';
                } else if (folder_name == 'linkedin-page-posts') {
                    other_folder = 'linkedin-page-post';
                } else if (folder_name == 'linkedin-profile-posts') {
                    other_folder = 'linkedin-profile-post';
                } else if (folder_name == 'facebook-hashtag-posts') {
                    other_folder = 'facebook-hashtag-feed';
                } else if (folder_name == 'facebook-page-events') {
                    other_folder = 'facebook-events';
                } else if (folder_name == 'facebook-page-posts') {
                    other_folder = 'facebook-feed';
                    if (document.querySelector(".sk-ww-facebook-feed")) {
                        var element = document.getElementsByClassName("sk-ww-facebook-feed")[0];
                        element.classList.add("sk-ww-facebook-page-posts");
                    }
                }
                other_result = src_str.search(other_folder);
                search_result = src_str.search(folder_name);
                if (search_result >= 1 || other_result >= 1) {
                    var src_arr = src_str.split(folder_name);
                    app_url = src_arr[0];
                    app_url = app_url.replace("displaysocialmedia.com", "sociablekit.com");
                    if (app_url.search("local") >= 1) {
                        app_backend_url = "http://localhost:3000/v1/";
                        app_url = "https://localtesting.com/SociableKIT_Widgets/";
                        app_file_server_url = "https://localtesting.com/SociableKIT_FileServer/feed/";
                        sk_app_url = "https://localtesting.com/SociableKIT/";
                        sk_api_url = "http://127.0.0.1:8000/";
                        sk_img_url = "https://localtesting.com/SociableKIT_Images/";
                    } else {
                        app_url = "https://widgets.sociablekit.com/";
                    }
                }
            }
        }
        return {
            "app_url": app_url,
            "app_backend_url": app_backend_url,
            "app_file_server_url": app_file_server_url,
            "sk_api_url": sk_api_url,
            "sk_app_url": sk_app_url,
            "sk_img_url": sk_img_url
        };
    }

    function changeBackSlashToBR(text) {
        if (text) {
            for (var i = 1; i <= 10; i++) {
                text = text.replace('\n', '</br>');
            }
        }
        return text;
    }

    function sKGetScrollbarWidth() {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        var inner = document.createElement('div');
        outer.appendChild(inner);
        var scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }

    function isValidURL(url) {
        const urlPattern = /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        return urlPattern.test(url);
    }
    async function showUrlData(element, url, post_id, type = "", show_thumbnail = 1) {
        element.hide();
        var free_data_url = app_file_server_url.replace("feed/", "get_fresh_url_tags.php") + '?post_id=' + post_id + '&url=' + url;
        var read_one_url = app_file_server_url.replace("feed", "url-tags") + post_id + ".json";
        if (jQuery('.sk_version').text()) {
            read_one_url += "?v=" + jQuery('.sk_version').text();
        }
        fetch(read_one_url, {
            method: 'get'
        }).then(async response => {
            if (response.ok) {
                let data = await response.json();
                if (data && data.status && data.status == 418) {
                    displayUrlData(data, element, type, show_thumbnail, post_id);
                    data = await jQuery.ajax(free_data_url);
                }
                return data;
            } else {
                response = await jQuery.ajax(free_data_url);
                displayUrlData(response, element, type, show_thumbnail, post_id);
                return response;
            }
        }).then(async response => {
            if (response != undefined) {
                displayUrlData(response, element, type, show_thumbnail, post_id);
            } else {
                response = await jQuery.ajax(free_data_url);
                displayUrlData(response, element, type, show_thumbnail, post_id);
            }
        }).catch(async error => {
            var data = await jQuery.ajax(free_data_url);
            displayUrlData(data, element, type, show_thumbnail, post_id);
        });
    }
    async function displayUrlData(response, element, type, show_thumbnail = 1, post_id) {
        var meta_holder = jQuery(element);
        var html = "";
        if (!response || response.error) {
            if (meta_holder.html()) {
                meta_holder.show();
            }
            return;
        }
        if (response.message && response.message == "Data not available. Please try again.") {
            return;
        }
        if (response.messages && response.messages.length > 0 && response.messages[0] == "PDF files that are over 10Mb are not supported by Google Docs Viewer") {
            var data = response.url;
            if (response.url) {
                data = response.url.replace("https://", "").split("/");
            }
            if (data.length > 0) {
                if (data.length > 1) {
                    response.title = data[data.length - 1];
                }
                response.description = data[0].replace("www.", "");
            }
        }
        if (post_id == "7059257055500492800") {
            response.url += "?id=122630";
        }
        html += "<a href='" + response.url + "' link-only target='_blank'>";
        html += "<div class='sk-link-article-container' style='background: #eeeeee;color: black !important; font-weight: bold !important; border-radius: 2px; border: 1px solid #c3c3c3; box-sizing: border-box; word-wrap: break-word;'>";
        if (show_thumbnail == 1) {
            html += "<image alt='No alternative text description for this image' class='sk-link-article-image sk_post_img_link' onerror='this.style.display=\"none\"' src='" + response.thumbnail_url + "'/>";
        }
        if (response.title) {
            html += "<div class='sk-link-article-title' style='padding: 8px;'>" + response.title + "</div>";
        } else if (response.url && response.url.indexOf(".pdf") != -1) {
            html += response.html;
        }
        if (type && type == 6) {
            if (response.description && response.description.length > 0) {
                response.description = response.description.length > 140 ? response.description.substring(0, 140) + ' ...' : response.description;
            }
        }
        if (response.description && response.description.indexOf("[vc_row]") !== -1 && response.url) {
            var pathArray = response.url.split('/');
            var protocol = pathArray[0];
            if (pathArray.length > 2) {
                var host = pathArray[2];
                var url = protocol + '//' + host;
                html += "<div class='sk-link-article-description' style='padding: 8px;color: grey;font-weight: 100;font-size: 14px;'>" + url + "</div>";
            }
        } else if (response.description && response.description.indexOf("fb_built") == -1 && response.description != "null") {
            if (response.url) {
                var domain = new URL(response.url).hostname;
                response.description = domain;
            }
            html += "<div class='sk-link-article-description' style='padding: 8px;color: #000000;font-weight: 100;font-size: 14px;'>" + response.description + "</div>";
        } else if (response.url && response.url.includes('instagram.com/p/')) {
            html += "<image style='padding: 8px;' alt='No alternative text description for this image' class='sk-ig-default' onerror='this.style.display=\"none\"' src='https://i1.wp.com/sociablekit.com/wp-content/uploads/2019/01/instagram.png'/>";
            html += "<div class='sk-link-article-description' style='padding: 8px;margin-left:15%;color: #000000;font-weight: 600;font-size: 14px;'>View this post in instagram</div>";
            html += "<div class='sk-link-article-description' style='padding: 0px 8px ;margin-left:15%;margin-bottom:10px;color: #000000;font-weight: 100;font-size: 10px;'>" + response.url + "</div>";
        }
        html += "</div>";
        html += "</a>";
        console.log(meta_holder);
        meta_holder.html(html);
        meta_holder.css('display', 'block');
        meta_holder.css('margin-bottom', '15px');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('display', 'inline-block');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('width', '100%');
        meta_holder.find('.sk-ig-default').css('width', '20%');
        meta_holder.find('.sk-ig-default').css('float', 'left');
        applyMasonry();
    }

    function slugifyString(str) {
        str = str.replace(/^\s+|\s+$/g, '');
        str = str.toLowerCase();
        var from = "ÃÃ„Ã‚Ã€ÃƒÃ…ÄŒÃ‡Ä†ÄŽÃ‰ÄšÃ‹ÃˆÃŠáº¼Ä”È†ÃÃŒÃŽÃÅ‡Ã‘Ã“Ã–Ã’Ã”Ã•Ã˜Å˜Å”Å Å¤ÃšÅ®ÃœÃ™Ã›ÃÅ¸Å½Ã¡Ã¤Ã¢Ã Ã£Ã¥ÄÃ§Ä‡ÄÃ©Ä›Ã«Ã¨Ãªáº½Ä•È‡Ã­Ã¬Ã®Ã¯ÅˆÃ±Ã³Ã¶Ã²Ã´ÃµÃ¸Ã°Å™Å•Å¡Å¥ÃºÅ¯Ã¼Ã¹Ã»Ã½Ã¿Å¾Ã¾ÃžÄÄ‘ÃŸÃ†aÂ·/_,:;";
        var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        return str;
    }

    function skGetBranding(sk_, user_info) {
        sk_.find('.sk_branding').remove();
        sk_.find('div.user_email').remove();
        var html = "";
        if (!user_info)
            return;
        var slugify_string = "";
        if (user_info.solution_name) {
            slugify_string = slugifyString(user_info.solution_name);
            user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
            if (user_info.website_builder) {
                user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string;
                slugify_string = slugifyString(user_info.website_builder);
                user_info.tutorial_link = user_info.tutorial_link + "-" + slugify_string;
            }
        }
        if (user_info.type == 9) {
            user_info.tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            user_info.tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        }
        if (user_info.show_branding && (user_info.show_branding == 1 || user_info.show_branding == "true") || user_info.show_branding == true) {
            var fontFamily = getSkSetting(sk_, "font_family");
            var link_color = getSkSetting(sk_, "details_link_color");
            var details_bg_color = getSkSetting(sk_, "details_bg_color");
            if (link_color == "") {
                link_color = "#04b07c";
            }
            if (details_bg_color && isTooDarkColor(link_color) == false && isTooDarkColor(details_bg_color) == false) {
                link_color = '#04b07c';
            }
            var temporary_tutorial_link = user_info.tutorial_link;
            if (temporary_tutorial_link.endsWith("/") == false) {
                temporary_tutorial_link = temporary_tutorial_link + "/";
            }
            var linkedin_widgets = [33, 34, 44, 58, 75, 99, 100, 103];
            if (linkedin_widgets.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-linkedin-feed-" + website_builder + "/";
            }
            if (user_info.type == 5 && user_info.embed_id % 2 == 1) {
                temporary_tutorial_link = temporary_tutorial_link.replace("profile", "feed")
            }
            var facebook_feed = [1, 4, 9, 10, 11, 36, 38, 43, 12, 24, 26, 49, 2, 8, 3, 18, 19, 28, 30, 61];
            if (facebook_feed.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-facebook-feed-" + website_builder + "/";
            }
            var threads_feed = [110];
            if (threads_feed.includes(user_info.type) && user_info.embed_id % 2 == 0) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-threads-" + website_builder + "/";
            }
            html += "<div class='sk_branding' style='visibility: hidden; padding:10px; display:none !important; text-align:center; text-decoration: none !important; color:#555; font-family:" + fontFamily + "; font-size:15px;'>";
            html += "<a class='tutorial_link' href='" + temporary_tutorial_link + "' target='_blank' style='text-underline-position:under; color:" + link_color + ";font-size:15px;'>";
            if (linkedin_widgets.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                html += "Embed LinkedIn Feed on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            } else if (facebook_feed.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                html += "Embed Facebook Feed on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            } else {
                html += "Embed " + user_info.solution_name + " on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            }
            html += " website";
            html += "</a>";
            html += "</div>";
        }
        return html;
    }

    function getRGB(rgbstr) {
        return rgbstr.substring(4, rgbstr.length - 1).replace(/ /g, '').replace('(', '').split(',');
    }

    function freeTrialEndedMessage(solution_info) {
        var sk_error_message = "<div class='sk_trial_ended_message'>";
        sk_error_message += "Customized feed is powered by <strong><a href='https://www.sociablekit.com/' target='_blank'>SociableKIT</a></strong>.<br>";
        sk_error_message += "If you're the owner of this website, your 7-day Free Trial has ended.<br>";
        sk_error_message += "If you want to continue using our services, please <strong><a target='_blank' href='https://www.sociablekit.com/app/users/subscription/subscription'>subscribe now</a></strong>.";
        sk_error_message += "</div>";
        return sk_error_message;
    }

    function isFreeTrialEnded(start_date) {
        var start_date = new Date(start_date);
        var current_date = new Date();
        var difference = current_date.getTime() - start_date.getTime();
        difference = parseInt(difference / (1000 * 60 * 60 * 24));
        return difference > 7 ? true : false;
    }

    function unableToLoadSKErrorMessage(solution_info, additional_error_messages) {
        var sk_error_message = "<ul class='sk_error_message'>";
        sk_error_message += "<li><a href='" + solution_info.tutorial_link + "' target='_blank'>Customized " + solution_info.solution_name + " feed by SociableKIT</a></li>";
        sk_error_message += "<li>Unable to load " + solution_info.solution_name + ".</li>";
        for (var i = 0; i < additional_error_messages.length; i++) {
            sk_error_message += additional_error_messages[i];
        }
        sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function widgetValidation(_sk, data) {
        if (data.user_info) {
            var user_info = data.user_info;
            user_info.trial_ended = false;
            if (user_info.status == 6 && user_info.start_date) {
                var start_date = new Date(user_info.start_date).getTime();
                var current_date = new Date().getTime();
                var difference = current_date - start_date;
                difference = parseInt(difference / (1000 * 60 * 60 * 24));
                user_info.show_feed = difference > 7 ? false : true;
                user_info.trial_ended = difference > 7 ? true : false;
            } else if (user_info.status == 7 && user_info.cancellation_date) {
                var cancellation_date = new Date(user_info.cancellation_date).setHours(0, 0, 0, 0);
                var current_date = new Date().setHours(0, 0, 0, 0);
                user_info.show_feed = current_date > cancellation_date ? false : true;
                var activation_date = new Date(user_info.activation_date).setHours(0, 0, 0, 0);
                if (activation_date > cancellation_date) {
                    user_info.show_feed = true;
                }
            } else if (user_info.status == 0 || user_info.status == 2 || user_info.status == 10) {
                user_info.show_feed = false;
            }
            if (!user_info.show_feed) {
                var sk_error_message = generateBlueMessage(_sk, user_info);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
            return user_info.show_feed;
        }
    }

    function generateBlueMessage(_sk, user_info) {
        var tutorial_link = "";
        if (user_info.solution_name) {
            var slugify_string = slugifyString(user_info.solution_name);
            tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
        }
        if (user_info.type == 9) {
            tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        }
        var sk_error_message = "";
        if (user_info.show_feed == false) {
            if (!user_info.message || user_info.message == "") {
                var sk_error_message = "<ul class='sk_error_message'>";
                sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>" + user_info.solution_name + " powered by SociableKIT</a></li>";
                sk_error_message += "<li>If youâ€™re the owner of this website or SociableKIT account used, we found some errors with your account.</li>";
                sk_error_message += "<li>Please login your SociableKIT account to fix it.</li>";
                sk_error_message += "</ul>";
                user_info.message = sk_error_message;
            }
            sk_error_message = user_info.message;
        } else if (user_info.solution_name == null && user_info.type == null && user_info.start_date == null) {
            sk_error_message = "<p class='sk_error_message'>";
            sk_error_message += "The SociableKIT solution does not exist. If you think this is a mistake, please contact support.";
            sk_error_message += "</p>";
        } else if (user_info.to_encode == 1 && user_info.encoded == false) {
            var learn_more_element = "<a style='color:#fff;' href='https://help.sociablekit.com/en-us/article/why-is-my-feed-not-working-19cw6zw/' target='_blank'><u>Learn more</u></a>."
            var styles = "style='background-color: #1972f5; text-align: center !important; margin-top: 50px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 30px; padding: 20px 45px; border-radius: 3px; color: white !important;'";
            sk_error_message = "<div " + styles + ">";
            sk_error_message += "<div style='width: auto; display: inline-block;'><i class='fa fa-spinner fa-pulse'></i></div> <div style='width: auto; display: inline-block;'>Your " + user_info.solution_name + " will appear soon. Please check back later! " + learn_more_element + "</div>";
            sk_error_message += "</div>";
        } else {
            sk_error_message = "<div class='sk_error_message'>";
            sk_error_message += "<div style='display: inline-flex;width:100%;'>";
            sk_error_message += "<div>";
            sk_error_message += "<ul>";
            sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>Customized " + user_info.solution_name + " feed by SociableKIT</a></li>";
            sk_error_message += "<li>Our system is syncing with your " + user_info.solution_name + " feed, please check back later.</li>";
            if (user_info.type == 5) {
                var username = getDsmSetting(_sk, 'username');
                sk_error_message += "<li>Make sure your instagram account <a target='_blank' href='https://www.instagram.com/" + username + "' target='_blank'><b>@" + username + "</b></a> is connected.</li>";
            }
            sk_error_message += "<li>It usually takes only a few minutes, but might take up to 24 hours. We appreciate your patience.</li>";
            sk_error_message += "<li>We will notify you via email once your " + user_info.solution_name + " feed is ready.</li>";
            sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
            sk_error_message += "</ul>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
        }
        return sk_error_message;
    }

    function generateSolutionMessage(_sk, embed_id) {
        var json_url = sk_api_url + "api/user_embed/info/" + embed_id;
        var sk_error_message = "";
        jQuery.getJSON(json_url, function (data) {
            if (data.type == 1 && data.encoded == true) {
                loadEvents(_sk);
            } else if (data.type == 44 && data.encoded == true) {
                loadFeed(_sk);
            } else if (data.type == 58 && data.encoded == true) {
                var no_data_text = _sk.find('.no_data_text').text();
                _sk.html("<div style='padding: 20px;text-align: center;'>" + no_data_text + "</div>");
            } else if (data.type == 67 && data.encoded == true) {
                loadEvents(_sk);
            } else if (data.type == 74 && data.encoded == true) {
                _sk.html("<div>No jobs yet, please try again later.</div>");
            } else {
                var sk_error_message = generateBlueMessage(_sk, data);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
        }).fail(function (e) {
            console.log(e);
        });
    }

    function copyInput(copy_button, copy_input) {
        var copy_button_orig_html = copy_button.html();
        copy_input.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            if (msg == 'successful') {
                copy_button.html("<i class='fa fa-clipboard'></i> Copied!");
                setTimeout(function () {
                    copy_button.html(copy_button_orig_html);
                }, 3000);
            } else {
                alert('Copying text command was ' + msg + '.');
            }
        } catch (err) {
            alert('Oops, unable to copy.');
        }
    }

    function getDefaultLinkedInPageProfilePicture(profile_picture) {
        if (profile_picture && profile_picture.indexOf("data:image/gif") != -1) {
            profile_picture = "https://gmalcilk.sirv.com/iamge.JPG";
        }
        return profile_picture;
    }

    function detectedSKDashboard() {
        let parent_url = (window.location != window.parent.location) ? document.referrer : document.location.href;
        if (parent_url && (parent_url.indexOf("sociablekit.com") != -1 || parent_url.indexOf("local") != -1)) {
            return true;
        }
        return false;
    }

    function getSKDashboardPremiumTrialMessage() {
        var sk_error_message = "";
        sk_error_message += "<ul class='sk_error_message'>";
        sk_error_message += "<li>Your 7-days premium trial has ended.</li>";
        sk_error_message += "<li>Please purchase a <a href='https://www.sociablekit.com/app/users/subscription/subscription?action=subscribe_now'>SociableKIT subscription plan</a> ";
        sk_error_message += "to save your widget customizations, save time with automatic sync, enjoy priority support, and get a 50% discount on any annual plans. Donâ€™t miss out!</li>";
        sk_error_message += "<li>You may also choose to <a href='https://help.sociablekit.com/en-us/article/how-to-activate-the-free-plan-1l3o0nt/'>activate the free plan</a> if you don't need our premium features.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function getSocialIcon(category) {
        var post_items = '';
        if (category.indexOf("Facebook") != -1) {
            post_items += "<i class='fab fa-facebook' aria-hidden='true'></i>";
        } else if (category.indexOf("Instagram") != -1) {
            post_items += "<i class='fab fa-instagram' aria-hidden='true'></i>";
        } else if (category.indexOf("Linkedin") != -1) {
            post_items += "<i class='fab fa-linkedin' aria-hidden='true'></i>";
        } else if (category.indexOf("Youtube") != -1) {
            post_items += "<i class='fab fa-youtube' aria-hidden='true'></i>";
        } else if (category.indexOf("Google") != -1) {
            post_items += "<i class='fab fa-google' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitter") != -1) {
            post_items += '<i class="fa-brands fa-x-twitter"></i>';
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Yelp") != -1) {
            post_items += "<i class='fab fa-yelp' aria-hidden='true'></i>";
        } else if (category.indexOf("Vimeo") != -1) {
            post_items += "<i class='fab fa-vimeo' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Trust") != -1) {
            post_items += "<i class='fab fa-trustpilot' aria-hidden='true'></i>";
        } else if (category.indexOf("Spot") != -1) {
            post_items += "<i class='fab fa-spotify' aria-hidden='true'></i>";
        }
        return post_items;
    }

    function isFontAwesomeLoaded() {
        var span = document.createElement('span');
        span.className = 'fa';
        span.style.display = 'none';
        document.body.insertBefore(span, document.body.firstChild);
        var font = css(span, 'font-family');
        if (font.indexOf("fontawesome") == -1) {
            return false;
        }
        document.body.removeChild(span);
        return true;
    }

    function css(element, property) {
        let font = window.getComputedStyle(element, null).getPropertyValue(property);
        if (font) {
            font = font.toLowerCase();
            return font.replace(/' '/g, "");
        }
        return 'na';
    }

    function main() {
        function loadSettingsData(sk_linkedin_recommendation, json_settings_url, json_feed_url) {
            fetch(json_feed_url, {
                method: 'get'
            }).then(function (response) {
                if (!response.ok) {
                    loadSettingsData(sk_linkedin_recommendation, json_settings_url, json_settings_url)
                    return;
                }
                response.json().then(function (data) {
                    var settings_data = data;
                    original_data = data;
                    if (data.settings) {
                        settings_data = data.settings;
                        settings_data.type = 34;
                    }
                    if (!settings_data.type) {
                        loadSettingsData(sk_linkedin_recommendation, json_settings_url, json_settings_url)
                        return;
                    }
                    settings_data.type = 34;
                    var web_safe_fonts = [
  "Inherit",
  "Impact, Charcoal, sans-serif",
  "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  "'Open Sans', sans-serif", // Added Open Sans here
  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
  "Verdana, Geneva, sans-serif",
  "Copperplate, 'Copperplate Gothic Light', fantasy",
  "'Courier New', Courier, monospace",
  "Georgia, Serif"
];
                    var is_font_included = web_safe_fonts.indexOf(settings_data.font_family);
                    if (is_font_included < 0) {
                        loadCssFile("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");
                    }
                    if (settings_data.show_feed == false) {
                        sk_linkedin_recommendation.prepend(settings_data.message);
                        sk_linkedin_recommendation.find('.loading-img').hide();
                        sk_linkedin_recommendation.find('.first_loading_animation').hide();
                    } else {
                        var settings_html = "";
                        settings_data.profile_name_color = settings_data.profile_name_color ? settings_data.profile_name_color : '#555555';
                        settings_data.show_profile_picture = settings_data.show_profile_picture ? settings_data.show_profile_picture : 1;
                        settings_data.show_profile_name = settings_data.show_profile_name ? settings_data.show_profile_name : 1;
                        settings_data.show_job_name = settings_data.show_job_name ? settings_data.show_job_name : 1;
                        settings_html += "<div style='display:none;' class='display-none sk-settings'>";
                        jQuery.each(settings_data, function (key, value) {
                            settings_html += "<div class='" + key + "'>" + value + "</div>";
                        });
                        settings_html += "</div>";
                        if (sk_linkedin_recommendation.find('.sk-settings').length) {} else {
                            sk_linkedin_recommendation.prepend(settings_html);
                        }
                        settings_html = "";
                        loadCssFile("https://cdn.jsdelivr.net/gh/mrsamimdraft/hosts@main/link-rec-styles.css");
                        if (data.settings) {
                            loadFeed(sk_linkedin_recommendation, "received");
                        } else {
                            requestFeedData(sk_linkedin_recommendation)
                        }
                    }
                });
            }).catch(function (err) {
                loadSettingsData(sk_linkedin_recommendation, json_settings_url, json_settings_url);
            });
        }
        jQuery(document).ready(function ($) {
            jQuery('.sk-ww-linkedin-recommendations').each(function () {
                var sk_linkedin_recommendation = jQuery(this);
                var embed_id = getDsmEmbedId(sk_linkedin_recommendation);
                var new_sk_linkedin_recommendation_width = jQuery(window).height() + 100;
                sk_linkedin_recommendation.height(new_sk_linkedin_recommendation_width);
                var json_settings_url = app_file_server_url.replace('feed', '') + "settings/" + embed_id + "/settings.json?nocache=" + (new Date()).getTime();
                var json_feed_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
                loadSettingsData(sk_linkedin_recommendation, json_settings_url, json_feed_url);
            });
            jQuery(window).resize(function () {
                jQuery('.sk-ww-linkedin-recommendations').each(function () {
                    var sk_linkedin_recommendation = jQuery(this);
                    sk_linkedin_recommendation.css({
                        'width': '100%'
                    });
                    var new_inner_width = sk_linkedin_recommendation.innerWidth();
                    jQuery('.sk_linkedin_recommendation_width').text(new_inner_width);
                    applyCustomUi(jQuery, sk_linkedin_recommendation);
                });
            });
            jQuery(document).on('click', '.sk-ww-linkedin-recommendations .grid-item-linkedin-recommendations .grid-content', function () {
                var clicked_element = jQuery(this).closest('.linkedin_recommendation');
                var sk_linkedin_recommendation = clicked_element.closest('.sk-ww-linkedin-recommendations');
                var content_src = clicked_element.children().find('.sk-popup-container');
                if (getDsmSetting(sk_linkedin_recommendation, 'show_pop_up') == 1) {
                    showPopUp(jQuery, content_src, clicked_element, sk_linkedin_recommendation);
                } else {
                    showPopUp(jQuery, content_src, clicked_element, sk_linkedin_recommendation);
                    jQuery(".grid-content video").prop('muted', true);
                }
            });
            jQuery(document).on('click', '.prev_recommendation', function () {
                var clicked_element = jQuery(this);
                var new_clicked_element = jQuery('.sk_selected_recommendation').prev('.linkedin_recommendation');
                var content_src = new_clicked_element.children().find('.sk-popup-container');
                showPopUp(jQuery, content_src, new_clicked_element);
            });
            jQuery(document).on('click', '.next_recommendation', function () {
                var clicked_element = jQuery(this);
                var new_clicked_element = jQuery('.sk_selected_recommendation').next('.linkedin_recommendation');
                var content_src = new_clicked_element.children().find('.sk-popup-container');
                showPopUp(jQuery, content_src, new_clicked_element);
            });
            jQuery(document).on('click', '.sk-see-more', function () {
                var sk_fb_event = jQuery(this).closest('.sk-ww-linkedin-recommendations');
                var long_description = jQuery(this).closest('.grid-content').find('.sk-long-description').html();
                var short_description = jQuery(this).closest('.grid-content').find('.sk-post-description').html();
                jQuery(this).closest('.grid-content').find('.sk-short-description').html(short_description);
                jQuery(this).closest('.grid-content').find('.sk-post-description').html(long_description);
                applyMasonry();
            });
            jQuery(document).on('click', '.recommendation_type_btn', function () {
                var sk_linkedin_recommendation = jQuery(this).closest('.sk-ww-linkedin-recommendations');
                selected_recommendation_type = jQuery(this).attr('type');
                sk_linkedin_recommendation.find('.sk-recommendation-type-feed-container').remove();
                loadFeed(sk_linkedin_recommendation);
                jQuery('.recommendation_type_btn').removeClass("sk-tab-active");
                jQuery('.recommendation_type_btn').addClass("sk-tab-inactive");
                jQuery("." + selected_recommendation_type + "-btn").removeClass("sk-tab-inactive");
                jQuery("." + selected_recommendation_type + "-btn").addClass("sk-tab-active");
            });
            jQuery(document).on('click', '.sk-ww-linkedin-recommendations .sk-linkedin-recommendations-load-more-posts', function () {
                if (jQuery(this).attr('disabled') == "disabled") {
                    return false;
                }
                jQuery(this).attr('disabled', 'disabled');
                var current_btn = jQuery(this);
                var current_btn_text = current_btn.text();
                var sk_linkedin_recommendation = jQuery(this).closest('.sk-ww-linkedin-recommendations');
                var embed_id = getDsmEmbedId(sk_linkedin_recommendation);
                jQuery(this).html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");
                setTimeout(function () {
                    current_btn.hide();
                    setTimeout(function () {
                        var post_items = "";
                        var enable_button = false;
                        var old_last_key = last_key;
                        last_key = old_last_key + parseInt(getDsmSetting(sk_linkedin_recommendation, 'post_count'));
                        var new_list = [];
                        for (var i = old_last_key; i < last_key; i++) {
                            if (typeof data_storage[i] != 'undefined') {
                                new_list = post_items += getFeedItem(data_storage[i], sk_linkedin_recommendation);
                            }
                        }
                        if (data_storage.length > last_key) {
                            enable_button = true;
                        }
                        current_btn.html(current_btn_text);
                        if (enable_button) {
                            current_btn.show();
                        }
                        sk_linkedin_recommendation.find('.grid-linkedin-recommendations').append(post_items);
                        current_btn.removeAttr('disabled');
                        applyCustomUi(jQuery, sk_linkedin_recommendation);
                        fixMasonry();
                        replaceBigFontSize(sk_linkedin_recommendation);
                        showLinkedinData(data_storage);
                    }, 300);
                }, 500);
            });
        });
    }
}(window, document));
