/-  g=groups
/-  meta
|%
++  enjs
  =,  enjs:format
  |%
  ++  ship
    |=  her=@p
    s/(scot %p her)
  ::
  ++  action
    |=  a=action:g
    %-  pairs
    :~  flag/s/(flag p.a)
        update/(update q.a)
    ==
  ::
  ++  preview
    |=  p=preview:g
    %-  pairs
    :~  time+(time time.p)
        meta+(meta meta.p)
        cordon+(cordon cordon.p)
    ==
  ::
  ++  update
    |=  =update:g
    %-  pairs
    :~  time+s+(scot %ud p.update)
        diff+(diff q.update)
    ==
  ::
  ++  diff
    |=  d=diff:g
    %+  frond  -.d
    ?-    -.d
      %fleet    (pairs ships/a/(turn ~(tap in p.d) ship) diff/(fleet-diff q.d) ~)
      %channel  (pairs flag/s/(flag p.d) diff/(channel-diff q.d) ~)
      %cabal    (pairs sect/s/p.d diff/(cabal-diff q.d) ~)
      %bloc     (bloc-diff p.d)
      %cordon   (cordon-diff p.d)
      %create   (group p.d)
      %zone     (zone-diff p.d)
    ==
  ::
  ++  zone-diff
    |=  d=diff:zone:g
    %-  pairs
    :~  zone/s/p.d
        delta/(zone-delta q.d)
    ==
  ::
  ++  zone-delta
    |=  d=delta:zone:g
    %+  frond  -.d
    ?-  -.d
      %del  ~
      %add  (meta meta.d)
    ==
  ::
  ++  bloc-diff
    |=  d=diff:bloc:g
    %+  frond  -.d
    a/(turn ~(tap in p.d) (lead %s))
  ::
  ++  cordon-diff
    |=  d=diff:cordon:g
    %+  frond  -.d
    ?-  -.d
      %open  (open-cordon-diff p.d)
      %shut  (shut-cordon-diff p.d)
      %swap  (cordon p.d)
    ==
  ::
  ++  open-cordon-diff
    |=  d=diff:open:cordon:g
    %+  frond  -.d
    ?-  -.d
      ?(%add-ships %del-ships)  a/(turn ~(tap in p.d) ship)
      ?(%add-ranks %del-ranks)  a/(turn ~(tap in p.d) (lead %s))
    ==
  ::
  ++  shut-cordon-diff
    |=  d=diff:shut:cordon:g
    %+  frond  -.d
    a/(turn ~(tap in p.d) ship)
  ::
  ++  channel-diff
    |=  d=diff:channel:g
    %+  frond  -.d
    ?-  -.d
      %add                      (channel channel.d)
      %del                      ~
      ?(%add-sects %del-sects)  a/(turn ~(tap in sects.d) (lead %s))
      %add-zone                 s/zone.d
      %del-zone                 ~
    ==
  ::
  ++  cabal-diff
    |=  d=diff:cabal:g
    %+  frond  -.d
    ?-  -.d
      %add  (meta meta.d)
      %del  ~
    ==
  ::
  ++  fleet-diff
    |=  d=diff:fleet:g
    %+  frond  -.d
    ?-  -.d
      %add  (vessel vessel.d)
      %del  ~
      %add-sects  a/(turn ~(tap in sects.d) (lead %s))
      %del-sects  a/(turn ~(tap in sects.d) (lead %s))
    ==
  ::
  ++  groups
    |=  gs=(map flag:g group:g)
    %-  pairs
    %+  turn  ~(tap by gs)
    |=  [f=flag:g gr=group:g]
    [(flag f) (group gr)]
  ::
  ++  gangs
    |=  gs=(map flag:g gang:g)
    %-  pairs
    %+  turn  ~(tap by gs)
    |=  [f=flag:g gr=gang:g]
    [(flag f) (gang gr)]
  ::
  ++  gang
    |=  ga=gang:g
    %-  pairs
    :~  claim/?~(cam.ga ~ (claim u.cam.ga))
        preview/?~(pev.ga ~ (preview u.pev.ga))
        invite/?~(vit.ga ~ (invite u.vit.ga))
    ==
  ::
  ++  claim
    |=  c=claim:g
    %-  pairs
    :~  join-all/b/join-all.c
        progress/s/`@t`progress.c
    ==
  ::
  ++  invite
    |=  i=invite:g
    `json`~
  ::
  ++  zones
    |=  zons=(map zone:g data:^meta)
    %-  pairs
    %+  turn  ~(tap by zons)
    |=  [=zone:g m=data:^meta]
    ^-  [@t json]
    [zone (meta m)]
  ::
  ++  group
    |=  gr=group:g
    %-  pairs
    :~  fleet/(fleet fleet.gr)
        cabals/(cabals cabals.gr)
        zones/(zones zones.gr)
        channels/(channels channels.gr)
        bloc/a/(turn ~(tap in bloc.gr) (lead %s))
        cordon/(cordon cordon.gr)
        meta/(meta meta.gr)
    ==
  ++  fleet
    |=  fl=fleet:g
    %-  pairs
    %+  turn  ~(tap by fl)
    |=  [her=@p v=vessel:fleet:g]
    ^-  [cord json]
    [(scot %p her) (vessel v)]
  ::
  ++  vessel
    |=  v=vessel:fleet:g
    %-  pairs
    :~  sects/a/(turn ~(tap in sects.v) (lead %s))
        joined/(time joined.v)
    ==
  ++  cabals
    |=  cs=(map sect:g cabal:g)
    %-  pairs
    %+  turn  ~(tap by cs)
    |=  [=term c=cabal:g]
    ^-  [cord json]
    [term (cabal c)]
  ::
  ++  cabal
    |=  c=cabal:g
    %-  pairs
    :~  meta/(meta meta.c)
    ==
  ++  flag
    |=  f=flag:g
    (rap 3 (scot %p p.f) '/' q.f ~)
  ::
  ++  channels
    |=  chs=(map flag:g channel:g)
    %-  pairs
    %+  turn  ~(tap by chs)
    |=  [f=flag:g c=channel:g]
    ^-  [cord json]
    [(flag f) (channel c)]
  ::
  ++  channel
    |=  ch=channel:g
    %-  pairs
    :~  meta/(meta meta.ch)
        added/(time added.ch)
        zone/?~(zon.ch ~ s/u.zon.ch)
    ==
  ::
  ++  cordon
    |=  c=cordon:g
    %+  frond  -.c
    ?-  -.c
      %open  (ban-cordon ban.c)
      %shut  a/(turn ~(tap in pending.c) ship)
      %afar  (afar-cordon +.c)
    ==
  ::
  ++  afar-cordon
    |=  [app=flag:g pax=^path desc=@t]
    %-  pairs
    :~  app/s/(flag app)
        path/s/(spat pax)
        desc/s/desc
    ==
  ::
  ++  ban-cordon
    |=  b=ban:open:cordon:g
    %-  pairs
    :~  ships/a/(turn ~(tap in ships.b) ship)
        ranks/a/(turn ~(tap in ranks.b) (lead %s))
    ==
  ::
  ++  meta
    |=  m=data:^meta
    %-  pairs
    :~  title/s/title.m
        description/s/description.m
        image/s/image.m
        color/s/color.m
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  sym  (se %tas)
  ++  ship  (se %p)
  ++  rank  (su (perk %czar %king %duke %earl %pawn ~))
  ++  flag  (su ;~((glue fas) ;~(pfix sig fed:ag) ^sym))
  ++  create
    ^-  $-(json create:g)
    %-  ot
    :~  name+sym
        title+so
        description+so
        image+so
        color+so
    ==
  ::
  ++  join
    ^-  $-(json join:g)
    %-  ot
    :~  flag/flag
        join-all/bo
    ==
  ++  action
    ^-  $-(json action:g)
    %-  ot
    :~  flag+flag
        update+update
    ==
  ++  update
    |=  j=json
    ^-  update:g
    ?>  ?=(%o -.j)
    [*time (diff (~(got by p.j) %diff))]
  ::
  ++  diff
    %-  of
    :~  cabal/(ot sect/sym diff/cabal-diff ~)
        fleet/(ot ships/(as ship) diff/fleet-diff ~)
        cordon/cordon-diff
        channel/(ot flag/flag diff/channel-diff ~)
    ==
  ::
  ++  channel-diff
    %-  of
    :~  add-sects/(as sym)
        del-sects/(as sym)
        add-zone/sym
        del-zone/ul
    ==
  ::
  ++  cordon
    %-  of
    :~  open/open-cordon
        shut/(as ship)
    ==
  ::
  ++  open-cordon
    %-  ot
    :~  ships/(as ship)
        ranks/(as rank)
    ==
  ::
  ++  cordon-diff
    %-  of
    :~  open/open-cordon-diff
        shut/shut-cordon-diff
        swap/cordon
    ==
  ::
  ++  open-cordon-diff
    %-  of
    :~  add-ships/(as ship)
        del-ships/(as ship)
        add-ranks/(as rank)
        del-ranks/(as rank)
    ==
  ::
  ++  shut-cordon-diff
    %-  of
    :~  add-ships/(as ship)
        del-ships/(as ship)
    ==
  ::
  ++  fleet-diff
    %-  of
    :~  [%add-sects (as sym)]
    ==
  ::
  ++  cabal-diff
    %-  of
    :~  add/meta
        del/ul
    ==
  ::
  ++  meta
    %-  ot
    :~  title/so
        description/so
        image/so
        color/so
    ==
  --
--
