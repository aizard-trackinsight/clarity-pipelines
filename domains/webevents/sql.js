const _ = require('lodash');
const friday = require('@trackinsight/friday');
const projects = ['etf.agefi.fr','etfcentral.com','fundinsight.nasdaq.com','trackinsight.com','etf.pionline.com','etfmarket.cboe.ca','etfmarket.cboe.com','etf.ft.com'];

const plainPageviewEvents = ['START_SESSION','CHANGE_ROUTE','CHANGE_PATH'];

const pathTypes = {

  'trackinsight.com':{

    'home':'^/(en|fr|es|pt|de|it|jp)/?$',
    'fund':'^/(en|fr|es|pt|de|it|jp)/fund/',
    'etf-providers':'^/(en|fr|es|pt|de|it|jp)/etf-providers/',
    'index':'^/(en|fr|es|pt|de|it|jp)/index/',
    'screener':'^/(en|fr|es|pt|de|it|jp)/etf-screener',
    'compare':'^/(en|fr|es|pt|de|it|jp)/compare-etfs',
    'news-home':'^/(en|fr|es|pt|de|it|jp)/etf-news$',
    'article':'^/(en|fr|es|pt|de|it|jp)/etf-news/',
    'education':'^/(en|fr|es|pt|de|it|jp)/education/',
    'investing-guides':'^/(en|fr|es|pt|de|it|jp)/investing-guides/',
    'esg-investing':'^/(en|fr|es|pt|de|it|jp)/esg-investing',
    'fixed-income-investing':'^/(en|fr|es|pt|de|it|jp)/fixed-income-investing',
    'thematic-investing':'^/(en|fr|es|pt|de|it|jp)/thematic-investing',
    'global-etf-survey':'^/global-etf-survey',
    'newsletter':'^/(en|fr|es|pt|de|it|jp)/newsletter',

    'enterprise':'^/enterprise',
    
    'portfolio-insights-hme':'^/(en|fr|es|pt|de|it|jp)/etf-portfolio-insights',
    'portfolio-app':'^/portfolios',
    'lists-home':'^/(en|fr|es|pt|de|it|jp)/lists/?$',
    'public-lists':'^/(en|fr|es|pt|de|it|jp)/lists/public-lists',
    'lists-app':'^/(en|fr|es|pt|de|it|jp)/lists/my-lists',
    'data-services':'^/services/data-services',
    'due-diligence-services':'^/services/due-diligence',
    'plans-page':'^/(en|fr|es|pt|de|it|jp)/plans'
  

  },
  'etfcentral.com':{
    'home':'^/?$',
    'segment':'^/segments/',
    'segments-home':'^/segments$',
    'screener':'^/etf-screener',
    'fund':'^/fund/',
    'etf-u':'^/etf-u',
    'news-home':'^/news$',
    'news':'^/news/',
    'author':'^/author/',
    'etf-institute':'^/etf-institute',
    'global-etf-survey':'^/global-etf-survey',
    'columns':'^/columns',
    'topics':'^/topics',
    'funds-home':'^/fund$',
    'compare':'^/compare-etfs'

  },
  'etfmarket.cboe.ca':{
    'home':'^/(en|fr)/?$',
    'fund':'^/(en|fr)/fund/',
    'screener':'^/(en|fr)/etf-screener',
    'news-home':'^/(en|fr)/(articles|news)$',
    
    'article':'^/(en|fr)/(article|news)/',
    
    'education':'^/(en|fr)/education/',
    'etf-course':'^/(en|fr)/etf-course',
    'trade-etfs':'^/(en|fr)/trade-etf',
    'newsletter':'^/(en|fr)/newsletter$',
  },
  'etfmarket.cboe.com':{
    'home':'^/canada/(en|fr)/?$',
    'fund':'^/canada/(en|fr)/fund/',
    'screener':'^/canada/(en|fr)/etf-screener',
    'news-home':'^/canada/(en|fr)/(articles|news)$',
    
    'article':'^/canada/(en|fr)/(article|news)/',
    
    'education':'^/canada/(en|fr)/education/',
    'etf-course':'^/canada/(en|fr)/etf-course',
    'trade-etfs':'^/canada/(en|fr)/trade-etf',
    'newsletter':'^/canada/(en|fr)/newsletter$',
  },
  
  'etf.agefi.fr':{
    'home':'^/?$',
    'fund':'^/etf/',
    'screener':'^/screener-etf',
    'news-home':'^/articles'
  },
  'etf.pionline.com':{
    'home':'^/?$',
    'screener':'^/etf-screener',
    'fund':'^/fund/'
  },
  'fundinsight.nasdaq.com':{
    'home':'^/?$',
    'screener':'^/universal-screener',
    'news':'^/newsroom',
    'login':'^/login',
    'exposure-check':'^/exposure-check',
    'smart-substitutions':'^/smart-substitutions',
    'portfolios':'^/portfolios',
    'welcome':'^/welcome',
    'segment':'^/segments/',
    'account':'^/account',
    'logout':'^/logout',
    'getting-started':'^/getting-started',
    'theme':'^/theme/'
  }
  
}

const referrers = {
  'google.':'Google',
  'bing.':'Bing',
  'search.brave.com':'Brave',
  'duckduckgo.com':'DuckDuckGo',
  'linkedin.com':'Linked In',
  'lnkd.in':'Linked In',
  'facebook.com':'Facebook',
  'youtube.com':'Youtube',
  'reddit.com':'Reddit',
  'twitter.com':'Twitter',
  'amazon-adsystem':'Amazon Ads',

  'zonebourse.com':'Zonebourse',
  'stocktwits.com':'Stocktwits',
  
  'www.agefi.fr':'Agefi',
  'www.nasdaq.com':'Nasdaq',
  'www.cboe.ca':'CBOE CA',
  'www.pionline.com':'P&I Online',

  'etf.ft.com':'Cross-project FT',
  'etf.pionline.com':'Cross-project P&I Online',
  'etfmarket.cboe.ca':'Cross-project CBOE CA',
  'etfmarket.neo.inc':'Cross-project CBOE CA',
  'etfmarket.cboe.com':'Cross-project CBOE AU',
  'www.etfcentral.com':'Cross-project ETFCentral',
  'fundinsight.nasdaq.com':'Cross-project Fundinsight'
  

}


const exclusionSnippet = `
  and lower(device) not like '%bot%'
  and lower(device) not like '%headless%'
  and lower(device) not like '%crawler%'
  and lower(device) not like '%spider%'`
  ;

const trafficSnippet = ({year, month, v=1}) => {
  var locationField, table;
  if (v==1) {
    locationField = "cast(json_extract(location,'$.path') as varchar)"
    table = 'AWSDataCatalog."clarity-prod".v_1'
  } else if (v==2) {
    locationField = "cast(json_extract(location,'$.p') as varchar)"
    table ='normalized_traffic_v2'
  }

  var q = `
    Traffic as (
      select
      ${v==1 ? "concat(year,'-',month,'-',day) as stamp,":""}
      date_format(date(concat(year,'-',month,'-',day)), '%Y-%v') as year_week,
      date_format(date(concat(year,'-',month,'-',day)), '%Y-%m') as year_month,
      concat(project,' + ',country,' + ',substr(device, 1, 87)) as session_group,
      *
      from ${table}
      where true
      ${exclusionSnippet}
      and ${locationField} not like '%/widget%'
      and year like '${year}'
      and month like '${month}'
      and day like '%'
      and contains(ARRAY[${projects.map(p => `'${p}'`).join(',')}], project)
    )`;
  return q;
}

const flaggedSessionsSnippet = ({}) => {

  var q = `
    SessionGroups as (
      select * from (
        select 
        stamp,
        project,
        country,
        session_group,
        count(*) as count
        from Traffic
        where eventtype in ('START_SESSION','CHANGE_ROUTE','CHANGE_PATH','CHANGE_QUERY','CHANGE_FRAGMENT')
        group by stamp,
        project,
        country,
        session_group
      )
      order by count desc
    ),

    SessionGroupMedians as (
      select
      session_group,
      approx_percentile(count, 0.5) as median
      from SessionGroups
      group by session_group
    ),

    sessionFlags as (
      select
      D.session_group,
      D.project,
      D.country,
      S.stamp,
      coalesce(SessionGroups.count, 0) as count,
      median,
      count/median as median_per_count,
      case
        when
            count > 2000
            or median > 1000
            or (D.country='Europe/Warsaw' and count > 50)
            or (D.country='America/Sao_Paulo' and count > 100)
            or (D.country='Pacific/Honolulu' and count > 100)
            or (D.country='America/Anchorage' and count > 200)
            or (D.country='Africa/Casablanca' and count > 200)
            or (D.country='Europe/Budapest' and count > 200)
            or (D.country='Europe/Kiev' and count > 150)           
        then true
        else false
      end as flag 
      from (select distinct session_group, project, country from SessionGroups) as D
      cross join (select distinct stamp from SessionGroups) as S
      left join SessionGroups on SessionGroups.session_group = D.session_group and SessionGroups.stamp=S.stamp
      left join SessionGroupMedians on SessionGroupMedians.session_group = SessionGroups.session_group
    ),

    flaggedSessions as (
      select * from sessionFlags where flag = true
    )`;
  return q;

};

const normalized_traffic_v2 = ({year, month}) => {

  var q = `
    with V as (
      select
      '${year}' as yearLike,
      '${month}' as monthLike,
      '%' as dayLike,
      ARRAY[${projects.map(p => `'${p}'`).join(',')}] as projects
    ),
      
    session_starts as (
      select
      *
      from AWSDataCatalog."clarity-prod".v_2
      where e = 'START_SESSION'
      and lower(n) not like '%bot%'
      and lower(n) not like '%headless%'
      and lower(n) not like '%spider%'
      and cast(json_extract(l,'$.p') as varchar) not like '%/widget%'
      and year like (select yearLike from V)
      and month like (select monthLike from V)
      and day like (select dayLike from V)
      and contains((select projects from V),p)
    )
    
    select 
    concat(v_2.year,'-',v_2.month,'-',v_2.day)  as stamp,
    v_2.e as eventtype,
    v_2.ei as eventid,
    session_starts.ui as userid,
    session_starts.si as sessionid,
    'deprecated' as "localtime",
    from_unixtime(v_2.t/1000) as utctime,
    session_starts.c as country,
    session_starts.n as device,
    session_starts.la as lang,
    session_starts.r as referrer,
    cast(null as boolean) as useadblock,
    
    v_2.l as location,
    v_2.d as eventdata,
    v_2.day,
    session_starts.year,
    session_starts.month,
    session_starts.p as project,
    case
      when v_2.e in ('HEARTBEAT','SCROLL','JAVASCRIPT_ERROR') then v_2.e
      when v_2.e in ('START_SESSION','CHANGE_ROUTE','CHANGE_PATH','CHANGE_QUERY','CHANGE_FRAGMENT') then 'PAGEVIEWS'
      else 'EVENTS'
    end as eventtype_class
    from session_starts
    left join AWSDataCatalog."clarity-prod".v_2 on v_2.si=session_starts.si
  `;

  return q;

};

// with V as (
//   select
//   '${year}' as yearLike,
//   '${month}' as monthLike,
//   '%' as dayLike,
//   ARRAY[${projects.map(p => `'${p}'`).join(',')}] as projects
// ),
const filtered_traffic_v2 = ({year,month}) => {

  var q = `

    with
    
    ${trafficSnippet({year, month, v:2})},

    ${flaggedSessionsSnippet({})}

    select
    Traffic."stamp",
    Traffic."eventtype",
    Traffic."eventid",
    Traffic."userid",
    Traffic."sessionid",
    Traffic."localtime",
    Traffic."utctime",
    Traffic."country",
    Traffic."device",
    Traffic."lang",
    Traffic."referrer",
    Traffic."useadblock",
    Traffic."location",
    cast(json_extract(location,'$.p') as varchar) as path,
    cast(json_extract(location,'$.s') as varchar) as params,
    Traffic."eventdata",
    
    -- partition columns
    cast('2' as varchar(3)) as v,
    "year",
    "month",
    Traffic.project,
    case
      when eventtype in ('HEARTBEAT','SCROLL','JAVASCRIPT_ERROR') then eventtype
      when eventtype in ('START_SESSION','CHANGE_ROUTE','CHANGE_PATH','CHANGE_QUERY','CHANGE_FRAGMENT') then 'PAGEVIEWS'
      else 'EVENTS'
    end as eventtype_class

    from Traffic
    left join flaggedSessions on flaggedSessions.session_group=Traffic.session_group and flaggedSessions.stamp=Traffic.stamp
    where flaggedSessions.session_group is null;
  `;

  return q;

};

const filtered_traffic_v1 = ({year,month}) => {

  var q = `
    with
      
    ${trafficSnippet({year, month, v:1})},

    ${flaggedSessionsSnippet({})}

    select
    Traffic."stamp",
    Traffic."eventtype",
    Traffic."eventid",
    Traffic."userid",
    Traffic."sessionid",
    Traffic."localtime",
    Traffic."utctime",
    Traffic."country",
    Traffic."device",
    Traffic."lang",
    Traffic."referrer",
    Traffic."useadblock",
    Traffic."location",
    cast(json_extract(location,'$.path') as varchar) as path,
    cast(json_extract(location,'$.search') as varchar) as params,
    Traffic."eventdata",
    
    -- partition columns
    cast('1' as varchar(3)) as v,
    "year",
    "month",
    Traffic.project,
    case
      when eventtype in ('HEARTBEAT','SCROLL','JAVASCRIPT_ERROR') then eventtype
      when eventtype in ('START_SESSION','CHANGE_ROUTE','CHANGE_PATH','CHANGE_QUERY','CHANGE_FRAGMENT') then 'PAGEVIEWS'
      else 'EVENTS'
    end as eventtype_class

    from Traffic
    left join flaggedSessions on flaggedSessions.session_group=Traffic.session_group and flaggedSessions.stamp=Traffic.stamp
    where flaggedSessions.session_group is null;

  `;
  return q;

};

const merged_traffic = ({year,month}) => {
  var q  = `
  select
  case
      when referrer is null then 'Unset'
      when regexp_like(referrer,project) then 'Internal'
      ${_.keys(referrers).map(r => {
        return `when regexp_like(referrer,'${r}') then '${referrers[r]}'`
      }).join('\n')}
      else 'Others'
  end as referrer_group,
  case
    when regexp_like(path,'^/(en|fr|es|pt|de|it|jp)/') then substring(path,4)
    when regexp_like(path,'^/(en|fr|es|pt|de|it|jp)$') then '/'
    else path
  end as global_path,
  case ${
    _.keys(pathTypes).map(k => {
      return `
      when project='${k}' then
        case 
          ${_.keys(pathTypes[k]).map(type => {
            return `when regexp_like(path,'${pathTypes[k][type]}') then '${type}'`
          }).join('\n')}
          else 'others'
        end`
    }).join('\n')
  }
  end as path_type,
  *
  
  from (
    (select * from "filtered_traffic_v1" where year='${year}' and month='${month}')
    union
    (select * from "filtered_traffic_v2" where year='${year}' and month='${month}')
  )
  
  `;
  return q;
}

const sessions = ({year, month}) => {

  var window = friday.getNNextYearMonth({year,month,n:2});

  var q =`
    with Traffic as (
      select
      *
      from merged_traffic
      where
        ${window.map(({year,month}) => `(year='${year}' and month='${month}')`).join(' \or ')}
    ),
    
    sessionAgg as (
      select
      sessionid,
      userid,
      project,
      min(year) as year,
      min(month) as month,
      count(*) as event_count,
      count(*) filter (where eventtype_class='PAGEVIEWS') pageviews_count,
      count(*) filter (where eventtype in (${plainPageviewEvents.map(e => `'${e}'`).join(',')})) plain_pageviews_count,
      array_agg(eventdata) filter (where eventtype='EXPERIMENT') as experiments,
      min(utctime) as start_utctime,
      max(utctime) as end_utctime,
      date_diff('second',min(utctime),max(utctime)) as elapsed
      from Traffic
      group by sessionid,userid,project
    ),
    
    sessionEdges as (
      select
      *,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_source'),-1),-1) as start_utm_source,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_campaign'),-1),-1) as start_utm_campaign,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_medium'),-1),-1) as start_utm_medium,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_content'),-1),-1) as start_utm_content
      from (
        select
        sessionid,
        max(case when rnk_1=1 then country end ) as country,
        max(case when rnk_1=1 then device end ) as device,
        max(case when rnk_1=1 then path else null end) as start_path,
        max(case when rnk_1=1 then path_type else null end) as start_path_type,
        max(case when rnk_1=1 then referrer_group else null end) as start_referrer_group,
        
        max(case when rnk_1=1 then 
          transform(
              split(replace(params,'?',''),'&'),
              x -> split(x,'=')
          )
          else null end
        ) as start_query_params,
    
        max(case when rnk_1=1 then referrer else null end) as start_referrer,
        max(case when rnk_1=1 then location else null end) as start_location,
        max(case when rnk_2=1 then location else null end) as end_location,
        max(case when rnk_2=1 then path else null end) as end_path,
        max(case when rnk_2=1 then path_type else null end) as end_path_type,
        max(case when rnk_1=1 then params else null end) as start_params,
        max(case when rnk_2=1 then params else null end) as end_params
        from (
          select
          *
          from (
            select
            sessionid,
            country,
            device,
            location,
            path,
            path_type,
            params,
            referrer,
            referrer_group,
            rank() OVER (PARTITION BY sessionid ORDER BY utctime asc) AS rnk_1,
            rank() OVER (PARTITION BY sessionid ORDER BY utctime desc) AS rnk_2
            from Traffic
          )
          where rnk_1=1 or rnk_2=1
        )
        group by sessionid
      )
    )
    
    select
    sessionAgg.sessionid,
    sessionAgg.userid,
    date(sessionAgg.start_utctime) as start_stamp,
    sessionAgg.event_count,
    sessionAgg.pageviews_count,
    sessionAgg.plain_pageviews_count,
    sessionAgg.experiments,
    sessionAgg.start_utctime,
    sessionAgg.end_utctime,
    sessionAgg.elapsed,
    sessionEdges.country,
    "clarity-metadata"."timezone_to_country".country as mapped_country,
    "clarity-metadata"."timezone_to_country".region as mapped_region,
    sessionEdges.device,
    sessionEdges.start_utm_source,
    sessionEdges.start_utm_campaign,
    sessionEdges.start_utm_medium,
    sessionEdges.start_utm_content,
    sessionEdges.start_query_params,
    sessionEdges.start_referrer,
    sessionEdges.start_referrer_group,
    sessionEdges.start_location,
    sessionEdges.end_location,
    sessionEdges.start_path,
    sessionEdges.start_path_type,
    sessionEdges.start_params,
    sessionEdges.end_path,
    sessionEdges.end_path_type,

    -- partition columns
    sessionAgg.year,
    sessionAgg.month,
    sessionAgg.project
    
    from sessionAgg
    left join sessionEdges on sessionEdges.sessionid=sessionAgg.sessionid
    left join "clarity-metadata"."timezone_to_country" on timezone=sessionEdges.country
    where 
    date_format(sessionAgg.start_utctime,'%Y-%m')='${year}-${month}'
  `;

  return q;

};

const session_clusters = ({year, month}) => {

  var window = friday.getNNextYearMonth({year,month,n:2});

  var q =`
    select
    userid,
    sessionid,
    concat(userid,'-',cast(sum(new_cluster) OVER (PARTITION BY userid ORDER BY start_utctime ROWS UNBOUNDED PRECEDING) as varchar)) as session_clusterid,

    -- partition columns
    '${year}' as year,
    '${month}' as month,
    project

    from (
        select
        project,
        userid,
        sessionid,
        start_utctime,
        CASE
          WHEN prev_session_start_utctime IS NULL THEN 1
          WHEN start_utctime <= prev_session_start_utctime +  INTERVAL '1' HOUR THEN 0
          ELSE 1
        END AS new_cluster
        from (
            select
            project,
            userid,
            sessionid,
            start_utctime,
            LAG(sessionid) OVER (partition by userid order by start_utctime) as prev_session_id,
            LAG(start_utctime) OVER (partition by userid order by start_utctime) as prev_session_start_utctime
            from AWSDataCatalog."clarity-pipelines-saturn".sessions
            where year='${year}'
            and month='${month}'
            order by userid, start_utctime
        )
    )
    
  `;

  return q;

};

const master_sessions = ({year, month}) => {

  var window = friday.getNNextYearMonth({year,month,n:2});

  var q =`
    select 
    *
    from (
        select
        session_clusters.userid,
        row_number() over (partition by session_clusterid order by start_utctime) as rn,
        count(sessions.sessionid) over (partition by session_clusterid) as subsessions,

        sum(sessions.event_count) over (partition by session_clusterid) as event_count,
        sum(sessions.pageviews_count) over (partition by session_clusterid) as pageviews_count,
        sum(sessions.plain_pageviews_count) over (partition by session_clusterid) as plain_pageviews_count,

        first_value(session_clusterid) over (partition by session_clusterid order by start_utctime) as session_clusterid,
        first_value(sessions.sessionid) over (partition by session_clusterid order by start_utctime) as master_sessionid,
        first_value(start_stamp) over (partition by session_clusterid order by start_utctime) as start_stamp,
        first_value(start_utctime) over (partition by session_clusterid order by start_utctime) as start_utctime,
        first_value(experiments) over (partition by session_clusterid order by start_utctime) as experiments,
        first_value(country) over (partition by session_clusterid order by start_utctime) as country,
        first_value(mapped_country) over (partition by session_clusterid order by start_utctime) as mapped_country,
        first_value(mapped_region) over (partition by session_clusterid order by start_utctime) as mapped_region,
        first_value(device) over (partition by session_clusterid order by start_utctime) as device,
        
        first_value(start_utm_source) over (partition by session_clusterid order by start_utctime) as start_utm_source,
        first_value(start_utm_campaign) over (partition by session_clusterid order by start_utctime) as start_utm_campaign,
        first_value(start_utm_medium) over (partition by session_clusterid order by start_utctime) as start_utm_medium,
        first_value(start_utm_content) over (partition by session_clusterid order by start_utctime) as start_utm_content,
        first_value(start_query_params) over (partition by session_clusterid order by start_utctime) as start_query_params,
        first_value(start_referrer) over (partition by session_clusterid order by start_utctime) as start_referrer,
        first_value(start_referrer_group) over (partition by session_clusterid order by start_utctime) as start_referrer_group,
        first_value(start_location) over (partition by session_clusterid order by start_utctime) as start_location,
        first_value(start_path) over (partition by session_clusterid order by start_utctime) as start_path,
        first_value(start_path_type) over (partition by session_clusterid order by start_utctime) as start_path_type,
        first_value(start_params) over (partition by session_clusterid order by start_utctime) as start_params,
        
        first_value(end_utctime) over (partition by session_clusterid order by end_utctime desc) as end_utctime,
        first_value(end_location) over (partition by session_clusterid order by end_utctime desc) as end_location,
        first_value(end_path) over (partition by session_clusterid order by end_utctime desc) as end_path,
        first_value(end_path_type) over (partition by session_clusterid order by end_utctime desc) as end_path_type,

        date_diff('second',
          first_value(start_utctime) over (partition by session_clusterid order by start_utctime),
          first_value(end_utctime) over (partition by session_clusterid order by end_utctime desc)
        ) as elapsed,

        -- partition columns
        '${year}' as year,
        '${month}' as month,
        session_clusters.project
        
        from AWSDataCatalog."clarity-pipelines-saturn".session_clusters
        left join AWSDataCatalog."clarity-pipelines-saturn".sessions on session_clusters.sessionid=sessions.sessionid
        where session_clusters.year='${year}'
        and session_clusters.month='${month}'
    )
    where rn=1
    
  `;

  return q;

};


const users = ({}) => {

  var q = `

    with Traffic as (
      select
      *
      from merged_traffic
    ),
    
    userAgg as (
      select
      userid,
      project,
      count(distinct sessionid) as sessions_count,
      count(*) as event_count,
      count(*) filter (where eventtype_class='PAGEVIEWS') pageviews_count,
      count(*) filter (where eventtype in (${plainPageviewEvents.map(e => `'${e}'`).join(',')})) plain_pageviews_count,
      element_at(array_agg(eventdata) filter (where eventtype='INVESTOR_TYPE'),-1) as investor_type,
      array_agg(eventdata) filter (where eventtype='INVESTOR_TYPE') as investor_types,
      min(utctime) as start_utctime,
      max(utctime) as end_utctime,
      date_diff('second',min(utctime),max(utctime)) as elapsed,
      date_diff('day',min(utctime),max(utctime)) as days_elapsed
      from Traffic
      group by userid, project
    ),
    
    userEdges as (
      select
      *,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_source'),-1),-1) as start_utm_source,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_campaign'),-1),-1) as start_utm_campaign,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_medium'),-1),-1) as start_utm_medium,
      element_at(element_at(filter(start_query_params, x->x[1]='utm_content'),-1),-1) as start_utm_content
      from (
        select
        userid,
        max(case when rnk_1=1 then path else null end) as start_path,
        max(case when rnk_1=1 then path_type else null end) as start_path_type,
        max(case when rnk_1=1 then 
          transform(
              split(replace(params,'?',''),'&'),
              x -> split(x,'=')
          )
          else null end
        ) as start_query_params,
    
        max(case when rnk_1=1 then referrer else null end) as start_referrer,
        max(case when rnk_1=1 then referrer_group else null end) as start_referrer_group,
        max(case when rnk_1=1 then location else null end) as start_location,
        max(case when rnk_2=1 then location else null end) as end_location,
        max(case when rnk_2=1 then path else null end) as end_path,
        max(case when rnk_2=1 then path_type else null end) as end_path_type,
        max(case when rnk_1=1 then params else null end) as start_params,
        max(case when rnk_2=1 then params else null end) as end_params
        from (
          select
          *
          from (
            select
            userid,
            location,
            path,
            path_type,
            params,
            referrer,
            referrer_group,
            rank() OVER (PARTITION BY userid ORDER BY utctime asc) AS rnk_1,
            rank() OVER (PARTITION BY userid ORDER BY utctime desc) AS rnk_2
            from Traffic
          )
          where rnk_1=1 or rnk_2=1
        )
        group by userid
      )
    )
    
    select
    userAgg.userid,
    userAgg.event_count,
    userAgg.sessions_count,
    userAgg.plain_pageviews_count,
    userAgg.pageviews_count,
    userAgg.investor_type,
    userAgg.investor_types,
    userAgg.start_utctime,
    userAgg.end_utctime,
    userAgg.elapsed,
    userAgg.days_elapsed,
    userEdges.start_utm_source,
    userEdges.start_utm_campaign,
    userEdges.start_utm_medium,
    userEdges.start_utm_content,
    userEdges.start_query_params,
    userEdges.start_referrer,
    userEdges.start_referrer_group,
    userEdges.start_location,
    userEdges.start_params,
    userEdges.start_path,
    userEdges.start_path_type,
    userEdges.end_path,
    userEdges.end_path_type,
    userEdges.end_location,
    userAgg.project
    from userAgg
    left join userEdges on userEdges.userid=userAgg.userid
  `;

  return q;

};

const enriched_traffic = ({year, month}) => {

  var q = `
    select
    sessions.sessionid,
    sessions.start_stamp,
    sessions.event_count,
    sessions.pageviews_count,
    sessions.plain_pageviews_count,
    sessions.experiments,
    sessions.start_utctime,
    sessions.end_utctime,
    sessions.elapsed,
    sessions.country,
    sessions.mapped_country,
    sessions.mapped_region,
    sessions.device,
    sessions.start_utm_source,
    sessions.start_utm_campaign,
    sessions.start_utm_medium,
    sessions.start_utm_content,
    sessions.start_query_params,
    sessions.start_referrer,
    sessions.start_referrer_group,
    sessions.start_location,
    sessions.start_path,
    sessions.start_path_type,
    sessions.start_params,
    sessions.end_path,
    sessions.end_path_type,
    sessions.end_location,
    
    users.userid,
    users.investor_type,
    
    traffic.utctime,
    traffic.eventtype,
    traffic.eventdata,
    traffic.location,
    traffic.path,
    traffic.path_type,
    traffic.params,

    -- partition columns
    sessions.year,
    sessions.month,
    sessions.project,
    traffic.eventtype_class

    from sessions
    left join merged_traffic as traffic on traffic.sessionid=sessions.sessionid
    left join users on users.userid=sessions.userid
    where sessions.year='${year}' and sessions.month='${month}'
  `;

  return q;

};

const enriched_traffic_master_sessions = ({year, month}) => {

  var q = `
    select
    sessions.master_sessionid,
    sessions.start_stamp,
    sessions.event_count,
    sessions.pageviews_count,
    sessions.plain_pageviews_count,
    sessions.experiments,
    sessions.start_utctime,
    sessions.end_utctime,
    sessions.elapsed,
    sessions.country,
    sessions.mapped_country,
    sessions.mapped_region,
    sessions.device,
    sessions.start_utm_source,
    sessions.start_utm_campaign,
    sessions.start_utm_medium,
    sessions.start_utm_content,
    sessions.start_query_params,
    sessions.start_referrer,
    sessions.start_referrer_group,
    sessions.start_location,
    sessions.start_path,
    sessions.start_path_type,
    sessions.start_params,
    sessions.end_path,
    sessions.end_path_type,
    sessions.end_location,
    
    users.userid,
    users.investor_type,
    
    traffic.utctime,
    traffic.eventtype,
    traffic.eventdata,
    traffic.location,
    traffic.path,
    traffic.path_type,
    traffic.params,

    -- partition columns
    sessions.year,
    sessions.month,
    sessions.project,
    traffic.eventtype_class

    from master_sessions as sessions
    left join session_clusters on session_clusters.session_clusterid=sessions.session_clusterid
    left join merged_traffic as traffic on traffic.sessionid=session_clusters.sessionid
    left join users on users.userid=sessions.userid
    where sessions.year='${year}' and sessions.month='${month}'
  `;

  return q;

};

const next_pathes = ({}) => {

  var q  = `
      with D as (
          select
          *,
          row_number() over (partition by path order by sessionid, rn1) as rn2,
          rn1 - row_number() over (partition by path order by sessionid, rn1) as d,
          concat(path,' [', cast(
              rn1 - row_number() over (partition by path order by sessionid, rn1)
          as varchar),']') as path_grp
          from  (
              select
              userid,sessionid,country,utctime,eventtype,eventdata,path,start_referrer,
              row_number() over (order by sessionid, utctime)  as rn1
              from enriched_traffic
              where project='trackinsight.com'
              and year='2023'
              and month='09'
              
              and (eventtype_class='PAGEVIEWS')
            )
      ),

      dedup as (
          select
          userid,sessionid,path,path_grp,min(utctime) utctime
          from D
          group by userid,sessionid,path,path_grp
      )

      select
      path, next_path, count(*)
      from (
          select
          sessionid,
          utctime,
          path,
          LAG(path,1) over (partition by sessionid order by utctime desc) as next_path,
          LAG(utctime,1) over (partition by sessionid order by utctime desc) as next_path_utctime
          from dedup
      ) 
      group by path, next_path
  `;

  return q;

};

const flagged_traffic  = ({year,month}) => {
  
  var q = `
    with
    
    ${trafficSnippet({year, month, v:2})},

    ${flaggedSessionsSnippet({})}

    select * from flaggedSessions
  `
  return q;

};

module.exports = {
  normalized_traffic_v2,
  filtered_traffic_v2,
  filtered_traffic_v1,
  merged_traffic,
  //filtered_traffic,
  sessions,
  session_clusters,
  master_sessions,
  users,
  enriched_traffic,
  enriched_traffic_master_sessions,
  flagged_traffic
};