# Table depencies 
normalized_traffic_v2
  <- filtered_traffic_v2
  <- filtered_traffic_v1
      <- merged_traffic
        <- sessions
        <- users
          <- enriched_traffic
  


# Metrics Definitions

# SESSION

# USER
Based on userid, kept accross sessions while user is using the same browser and do not clean his cookies

# PAGEVIEW
Events among:
  - START_SESSION,
  - CHANGE_ROUTE (deprecated)
  - CHANGE_PATH
  - CHANGE_QUERY
  - CHANGE_FRAGMENT

# PLAIN_PAGEVIEW
Events among:
  - START_SESSION,
  - CHANGE_ROUTE (deprecated)
  - CHANGE_PATH
