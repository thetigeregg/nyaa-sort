// ==UserScript==
// @name         Highlight Good and Bad Terms in Anchor Text
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Highlight release group names from TRaSH Guides tier lists on Nyaa.si search results, with options to hide unhighlighted / LQ results and sort by rank.
// @author       You
// @updateURL    https://raw.githubusercontent.com/thetigeregg/nyaa-sort/main/nyaa-sort.user.js
// @downloadURL  https://raw.githubusercontent.com/thetigeregg/nyaa-sort/main/nyaa-sort.user.js
// @grant        none
// @include      https://nyaa.si/*
// ==/UserScript==

(async function () {
    'use strict';

    // ---------------------------------------------------------------------------
    // Configuration
    //
    // COLLECTIONS is ordered by descending quality across all categories:
    //   Anime BD (8 tiers) > Anime Web (6 tiers) > Web (3 tiers)
    //
    // The rank badge shows globalRank/totalCollections, where globalRank is the
    // 1-based position of the collection in this list and totalCollections is
    // the total number of collections (17). Both are derived automatically.
    //
    //   e.g.  group in Anime BD Tier 01  ->  1/17
    //         group in Anime Web Tier 01  ->  9/17
    //         group in Web Tier 03        ->  17/17
    // ---------------------------------------------------------------------------

    const COLLECTIONS = [
        // --- Anime BD tiers ---
        {
            label:   'Anime BD Tier 01',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-01.json',
            color:   '#4caf7d',
            bgColor: '#4caf7d18',
        },
        {
            label:   'Anime BD Tier 02',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-02.json',
            color:   '#2aa87e',
            bgColor: '#2aa87e18',
        },
        {
            label:   'Anime BD Tier 03',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-03.json',
            color:   '#7cb342',
            bgColor: '#7cb34218',
        },
        {
            label:   'Anime BD Tier 04',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-04.json',
            color:   '#9cba5a',
            bgColor: '#9cba5a18',
        },
        {
            label:   'Anime BD Tier 05',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-05.json',
            color:   '#b5c77a',
            bgColor: '#b5c77a18',
        },
        {
            label:   'Anime BD Tier 06',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-06.json',
            color:   '#f9a825',
            bgColor: '#f9a82518',
        },
        {
            label:   'Anime BD Tier 07',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-07.json',
            color:   '#ff6f00',
            bgColor: '#ff6f0018',
        },
        {
            label:   'Anime BD Tier 08',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-bd-tier-08.json',
            color:   '#ff8f00',
            bgColor: '#ff8f0018',
        },

        // --- Anime Web tiers ---
        {
            label:   'Anime Web Tier 01',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-01.json',
            color:   '#3a9fd4',
            bgColor: '#3a9fd418',
        },
        {
            label:   'Anime Web Tier 02',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-02.json',
            color:   '#6db8d4',
            bgColor: '#6db8d418',
        },
        {
            label:   'Anime Web Tier 03',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-03.json',
            color:   '#90afc0',
            bgColor: '#90afc018',
        },
        {
            label:   'Anime Web Tier 04',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-04.json',
            color:   '#ce93d8',
            bgColor: '#ce93d818',
        },
        {
            label:   'Anime Web Tier 05',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-05.json',
            color:   '#ba68c8',
            bgColor: '#ba68c818',
        },
        {
            label:   'Anime Web Tier 06',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/anime-web-tier-06.json',
            color:   '#ab47bc',
            bgColor: '#ab47bc18',
        },

        // --- Live-action Web tiers ---
        {
            label:   'Web Tier 01',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/web-tier-01.json',
            color:   '#ff4081',
            bgColor: '#ff408118',
        },
        {
            label:   'Web Tier 02',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/web-tier-02.json',
            color:   '#f48fb1',
            bgColor: '#f48fb118',
        },
        {
            label:   'Web Tier 03',
            url:     'https://raw.githubusercontent.com/TRaSH-Guides/Guides/refs/heads/master/docs/json/sonarr/cf/web-tier-03.json',
            color:   '#f8bbd0',
            bgColor: '#f8bbd018',
        },
    ];

    // Stamp each collection with its 1-based global rank and the shared total.
    // Adding or removing a collection from the list above is all that's needed.
    const TOTAL_COLLECTIONS = COLLECTIONS.length;
    COLLECTIONS.forEach(function(col, i) {
        col.globalRank = i + 1;
        col.total      = TOTAL_COLLECTIONS;
    });

    const BAD_COLLECTION = {
        label:      'LQ Group',
        globalRank: null,
        total:      null,
        url:        'https://raw.githubusercontent.com/TRaSH-Guides/Guides/e0d4761b7a63a8f9a3bfb41d481e2b7fd35d74f9/docs/json/radarr/cf/anime-lq-groups.json',
        color:      '#ff1744',
        bgColor:    '#ff174418',
    };

    // ---------------------------------------------------------------------------
    // Fetch helpers
    // ---------------------------------------------------------------------------

    const fetchGroupSpecs = async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            return data.specifications
                .filter(function(item) { return item.implementation === 'ReleaseTitleSpecification'; })
                .map(function(item) { return { name: item.name, pattern: item.fields.value }; });
        } catch (err) {
            console.error('[TRaSH Highlighter] Failed to fetch ' + url + ':', err);
            return [];
        }
    };

    // ---------------------------------------------------------------------------
    // Build the list of terms to match
    //
    // Each term uses TRaSH's own regex rather than the group's name. Groups named
    // after common words depend on this: RaiN must appear as [RaiN] or -RaiN, so
    // the word "Rain" in a show's title doesn't count.
    //
    // First good collection to claim a group wins.
    // Bad groups are only added if no good collection claimed them.
    // ---------------------------------------------------------------------------

    const buildTerms = async function() {
        const [goodResults, badSpecs] = await Promise.all([
            Promise.all(COLLECTIONS.map(async function(col) {
                return { col: col, specs: await fetchGroupSpecs(col.url) };
            })),
            fetchGroupSpecs(BAD_COLLECTION.url),
        ]);

        const results = goodResults.concat({ col: BAD_COLLECTION, specs: badSpecs });
        const claimed = new Set();
        const terms   = [];

        results.forEach(function(result) {
            result.specs.forEach(function(spec) {
                var key = spec.name.toLowerCase();
                if (claimed.has(key)) return;
                claimed.add(key);
                try {
                    terms.push({ col: result.col, regex: new RegExp(spec.pattern, 'di') });
                } catch (err) {
                    console.error('[TRaSH Highlighter] Bad pattern for ' + spec.name + ':', err);
                }
            });
        });

        return terms;
    };

    // ---------------------------------------------------------------------------
    // Highlighting
    // ---------------------------------------------------------------------------

    // Returns the non-overlapping { start, end, entry } matches in text, in order.
    const findMatches = function(terms, text) {
        // TRaSH patterns like -ANE$ expect the title to end at the group, but
        // single-file torrent titles end in an extension.
        var title = text.replace(/(\.(mkv|mp4|avi|ts|m2ts))?\s*$/i, '');
        var found = [];

        terms.forEach(function(entry) {
            var match = entry.regex.exec(title);
            if (!match) return;

            // Patterns with .* (PMR, NAN0) also check for "remux" elsewhere in the
            // title, so only their first group is the group's name. Otherwise the
            // whole match is, apart from any surrounding [] or -.
            var range = match.indices[entry.regex.source.indexOf('.*') === -1 ? 0 : 1];
            var start = range[0];
            var end   = range[1];
            while (start < end && '[-'.indexOf(title[start]) !== -1) start++;
            while (end > start && ']-'.indexOf(title[end - 1]) !== -1) end--;

            found.push({ start: start, end: end, entry: entry });
        });

        found.sort(function(a, b) {
            return a.start - b.start || b.end - a.end;
        });

        var last = 0;
        return found.filter(function(item) {
            if (item.start < last) return false;
            last = item.end;
            return true;
        });
    };

    const injectStyles = function() {
        if (document.getElementById('trash-highlighter-styles')) return;
        const style = document.createElement('style');
        style.id = 'trash-highlighter-styles';
        style.textContent = [
            '.trash-hl {',
            '    font-weight: bold;',
            '    border-radius: 3px;',
            '    padding: 0 2px;',
            '    position: relative;',
            '    cursor: default;',
            '    text-decoration: underline dotted;',
            '    text-underline-offset: 2px;',
            '    white-space: nowrap;',
            '}',
            '.trash-hl::after {',
            '    content: attr(data-label);',
            '    position: absolute;',
            '    bottom: calc(100% + 6px);',
            '    left: 50%;',
            '    transform: translateX(-50%);',
            '    background: #1a1a2e;',
            '    color: #e0e0e0;',
            '    font-size: 11px;',
            '    font-weight: normal;',
            '    white-space: nowrap;',
            '    padding: 3px 7px;',
            '    border-radius: 4px;',
            '    pointer-events: none;',
            '    opacity: 0;',
            '    transition: opacity 0.15s ease;',
            '    z-index: 9999;',
            '    box-shadow: 0 2px 8px rgba(0,0,0,0.5);',
            '}',
            '.trash-hl:hover::after {',
            '    opacity: 1;',
            '}',
            '.trash-rank {',
            '    display: inline-flex;',
            '    flex-direction: column;',
            '    align-items: center;',
            '    vertical-align: super;',
            '    font-size: 0.55em;',
            '    font-weight: bold;',
            '    line-height: 1.1;',
            '    margin-left: 1px;',
            '    opacity: 0.9;',
            '}',
            '.trash-rank-num {',
            '    display: block;',
            '    border-bottom: 1px solid currentColor;',
            '    padding: 0 1px 1px;',
            '    text-align: center;',
            '    min-width: 1.4em;',
            '}',
            '.trash-rank-den {',
            '    display: block;',
            '    padding: 1px 1px 0;',
            '    text-align: center;',
            '    min-width: 1.4em;',
            '}',
            '.trash-controls {',
            '    display: flex;',
            '    flex-wrap: wrap;',
            '    align-items: center;',
            '    gap: 4px 16px;',
            '    margin: 0 0 8px;',
            '    font-size: 12px;',
            '}',
            '.trash-controls label {',
            '    display: inline-flex;',
            '    align-items: center;',
            '    gap: 5px;',
            '    margin: 0;',
            '    font-weight: normal;',
            '    cursor: pointer;',
            '    user-select: none;',
            '}',
            '.trash-controls input {',
            '    margin: 0;',
            '}',
            'table.trash-hide-plain tr.trash-row-plain,',
            'table.trash-hide-bad tr.trash-row-bad {',
            '    display: none;',
            '}',
        ].join('\n');
        document.head.appendChild(style);
    };

    const buildSpan = function(rawTerm, entry) {
        var col  = entry.col;
        var span = document.createElement('span');

        span.className        = 'trash-hl';
        span.dataset.label    = col.label;
        span.style.color      = col.color;
        span.style.background = col.bgColor;
        span.appendChild(document.createTextNode(rawTerm));

        if (col.globalRank !== null) {
            var badge = document.createElement('span');
            badge.className   = 'trash-rank';
            badge.style.color = col.color;

            var num = document.createElement('span');
            num.className   = 'trash-rank-num';
            num.textContent = col.globalRank;

            var den = document.createElement('span');
            den.className   = 'trash-rank-den';
            den.textContent = col.total;

            badge.appendChild(num);
            badge.appendChild(den);
            span.appendChild(badge);
        }

        return span;
    };

    // Returns a Map of results-table row -> { rank, bad } for every row that
    // had at least one term highlighted. rank is the best (lowest) globalRank
    // matched in the row, or null if only bad terms matched.
    const highlightAnchors = function(terms, root) {
        var rowMatches = new Map();

        root.querySelectorAll('a').forEach(function(anchor) {
            if (anchor.children.length > 0) return;

            var text     = anchor.textContent;
            var fragment = document.createDocumentFragment();
            var last     = 0;

            findMatches(terms, text).forEach(function(item) {
                var entry = item.entry;

                fragment.appendChild(document.createTextNode(text.slice(last, item.start)));
                fragment.appendChild(buildSpan(text.slice(item.start, item.end), entry));
                last = item.end;

                var row = anchor.closest('table.torrent-list > tbody > tr');
                if (row) {
                    var info = rowMatches.get(row);
                    if (!info) {
                        info = { rank: null, bad: false };
                        rowMatches.set(row, info);
                    }
                    if (entry.col.globalRank === null) {
                        info.bad = true;
                    } else if (info.rank === null || entry.col.globalRank < info.rank) {
                        info.rank = entry.col.globalRank;
                    }
                }
            });

            if (last > 0) {
                fragment.appendChild(document.createTextNode(text.slice(last)));
                anchor.textContent = '';
                anchor.appendChild(fragment);
            }
        });

        return rowMatches;
    };

    // ---------------------------------------------------------------------------
    // Results table controls: hide unhighlighted / LQ rows, sort by rank
    //
    // A row containing any LQ group term counts as bad, even if a good term
    // also matched. When sorting by rank, ranked rows come first (best tier at
    // the top), then unhighlighted rows, then bad rows. Ties keep the page's
    // original order.
    //
    // "Load all pages" merges the search's other result pages into this table so
    // the controls cover the whole search. It only runs when clicked, one page at
    // a time, because Nyaa is behind DDoS-Guard and its rate limit is unknown.
    // ---------------------------------------------------------------------------

    const SETTINGS_KEY  = 'trash-highlighter-settings';
    const PAGE_DELAY_MS = 1000;
    const RESULT_CAP    = 1000;

    const loadSettings = function() {
        var settings = { hidePlain: false, hideBad: false, sortByRank: false };
        try {
            Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY)));
        } catch (err) { /* keep defaults */ }
        return settings;
    };

    const saveSettings = function(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (err) { /* storage unavailable */ }
    };

    // Returns the current page and total pages from Nyaa's pagination links.
    const readPagination = function() {
        var total = 1;
        document.querySelectorAll('ul.pagination li a').forEach(function(link) {
            var page = parseInt(link.textContent, 10);
            if (page > total) total = page;
        });
        var active = document.querySelector('ul.pagination li.active a');
        return { current: active ? parseInt(active.textContent, 10) : 1, total: total };
    };

    const fetchPageBody = async function(page) {
        var url = new URL(location.href);
        url.searchParams.set('p', page);

        const response = await fetch(url.href);
        if (!response.ok) throw new Error('HTTP ' + response.status);

        // A DDoS-Guard challenge can arrive as a 200 with no results table.
        var doc   = new DOMParser().parseFromString(await response.text(), 'text/html');
        var tbody = doc.querySelector('table.torrent-list > tbody');
        if (!tbody) throw new Error('No results table in response');
        return tbody;
    };

    // Nyaa's own script converts timestamps to local time only once, on page load.
    const localizeTimestamps = function(root) {
        if (typeof window._format_date !== 'function') return;
        if (typeof window._format_time_difference !== 'function') return;

        var now = (Date.now() / 1000) | 0;
        root.querySelectorAll('[data-timestamp]').forEach(function(cell) {
            var timestamp = parseInt(cell.getAttribute('data-timestamp'), 10);
            if (!timestamp) return;
            cell.textContent = window._format_date(new Date(timestamp * 1000), false);
            cell.title       = window._format_time_difference(now - timestamp);
        });
    };

    const setupControls = function(rowMatches, terms) {
        var table = document.querySelector('table.torrent-list');
        var tbody = table && table.tBodies[0];
        if (!tbody) return;

        var pagination = readPagination();
        var plainCount = 0;
        var badCount   = 0;
        var seenLinks  = new Set();
        var rows       = [];

        var addRows = function(newRows, matches, page) {
            Array.prototype.forEach.call(newRows, function(row, i) {
                // New uploads can push a row onto the next page during a load.
                var link = row.querySelector('a[href^="/view/"]');
                var href = link && link.getAttribute('href').split('#')[0];
                if (href) {
                    if (seenLinks.has(href)) return;
                    seenLinks.add(href);
                }

                var info = matches.get(row);
                var sortKey;

                if (!info) {
                    row.classList.add('trash-row-plain');
                    sortKey = TOTAL_COLLECTIONS + 1;
                    plainCount++;
                } else if (info.bad) {
                    row.classList.add('trash-row-bad');
                    sortKey = TOTAL_COLLECTIONS + 2;
                    badCount++;
                } else {
                    sortKey = info.rank;
                }

                rows.push({ row: row, page: page, index: i, sortKey: sortKey });
            });
        };

        addRows(tbody.rows, rowMatches, pagination.current);

        var settings = loadSettings();

        var apply = function() {
            table.classList.toggle('trash-hide-plain', settings.hidePlain);
            table.classList.toggle('trash-hide-bad', settings.hideBad);

            rows.slice().sort(function(a, b) {
                if (settings.sortByRank && a.sortKey !== b.sortKey) {
                    return a.sortKey - b.sortKey;
                }
                return a.page - b.page || a.index - b.index;
            }).forEach(function(item) {
                tbody.appendChild(item.row);
            });
        };

        var bar = document.createElement('div');
        bar.className = 'trash-controls';

        var addToggle = function(key, text) {
            var label = document.createElement('label');
            var input = document.createElement('input');
            input.type    = 'checkbox';
            input.checked = settings[key];
            input.addEventListener('change', function() {
                settings[key] = input.checked;
                saveSettings(settings);
                apply();
            });
            var textNode = document.createTextNode(text);
            label.appendChild(input);
            label.appendChild(textNode);
            bar.appendChild(label);
            return textNode;
        };

        var plainText = addToggle('hidePlain', '');
        var badText   = addToggle('hideBad', '');
        addToggle('sortByRank', 'Sort by rank');

        var updateCounts = function() {
            plainText.data = 'Hide unhighlighted (' + plainCount + ')';
            badText.data   = 'Hide LQ groups (' + badCount + ')';
        };
        updateCounts();

        if (pagination.total > 1) {
            var pending = [];
            for (var page = 1; page <= pagination.total; page++) {
                if (page !== pagination.current) pending.push(page);
            }

            var button = document.createElement('button');
            button.type        = 'button';
            button.className   = 'btn btn-default btn-xs';
            button.textContent = 'Load all pages (' + pagination.total + ')';

            var finishLoading = function() {
                var info   = document.querySelector('.pagination-page-info');
                var capped = info && new RegExp('out of ' + RESULT_CAP + ' results').test(info.textContent);

                document.querySelectorAll('ul.pagination, .pagination-page-info').forEach(function(el) {
                    el.style.display = 'none';
                });

                var status = document.createElement('span');
                status.textContent = 'All ' + rows.length + ' results loaded';
                if (capped) status.textContent += ' (Nyaa shows ' + RESULT_CAP + ' at most)';
                button.replaceWith(status);
            };

            button.addEventListener('click', async function() {
                button.disabled = true;

                while (pending.length) {
                    var next = pending[0];
                    button.textContent = 'Loading page ' + next + '/' + pagination.total + '…';

                    var body;
                    try {
                        body = await fetchPageBody(next);
                    } catch (err) {
                        // Don't retry automatically: this may be a rate limit.
                        console.error('[TRaSH Highlighter] Failed to load page ' + next + ':', err);
                        button.textContent = 'Stopped at page ' + next + ', retry';
                        button.disabled    = false;
                        return;
                    }

                    var matches = highlightAnchors(terms, body);
                    localizeTimestamps(body);
                    addRows(body.rows, matches, next);
                    updateCounts();
                    apply();

                    pending.shift();
                    if (pending.length) {
                        await new Promise(function(resolve) { setTimeout(resolve, PAGE_DELAY_MS); });
                    }
                }

                finishLoading();
            });

            bar.appendChild(button);
        }

        var anchorEl = table.closest('.table-responsive') || table;
        anchorEl.parentNode.insertBefore(bar, anchorEl);

        apply();
    };

    // ---------------------------------------------------------------------------
    // Entry point
    // ---------------------------------------------------------------------------

    const main = async function() {
        injectStyles();
        const terms = await buildTerms();
        const rowMatches = highlightAnchors(terms, document);
        // Without any terms every row would count as unhighlighted.
        if (terms.length) setupControls(rowMatches, terms);
    };

    await main();

})();
