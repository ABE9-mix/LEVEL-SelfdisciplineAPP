      <Frame name="组件库-标准 v2" x={4050} y={0} w={1400} h={3560} bg="#1a1a1a" flex="none">
      <Text x={40} y={24} w={1320} h={24} size={24} color="var:text/primary">① Bar/Status 状态栏 390×28</Text>
      <Frame name="Bar/Status, kind=default" x={40} y={60} w={390} h={28} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={390} h={28} bg="var:bg/sunken" flex="none" />
        <Text x={10} y={6} w={60} h={16} size={12} color="var:text/primary">9:41</Text>
        <Frame name="sig0" x={320} y={18} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="sig1" x={326} y={14} w={4} h={8} bg="var:text/primary" flex="none" />
        <Frame name="sig2" x={332} y={10} w={4} h={12} bg="var:text/primary" flex="none" />
        <Frame name="sig3" x={338} y={6} w={4} h={16} bg="var:text/primary" flex="none" />
        <Frame name="bat" x={352} y={9} w={22} h={10} stroke="var:text/primary" strokeWidth={1} flex="none" />
        <Frame name="batcap" x={374} y={12} w={2} h={4} bg="var:text/primary" flex="none" />
      </Frame>
      <Frame name="Bar/Status, kind=inverse" x={470} y={60} w={390} h={28} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={390} h={28} bg="var:line/strong" flex="none" />
        <Text x={10} y={6} w={60} h={16} size={12} color="var:text/inverse">9:41</Text>
        <Frame name="sig0" x={320} y={18} w={4} h={4} bg="var:text/inverse" flex="none" />
        <Frame name="sig1" x={326} y={14} w={4} h={8} bg="var:text/inverse" flex="none" />
        <Frame name="sig2" x={332} y={10} w={4} h={12} bg="var:text/inverse" flex="none" />
        <Frame name="sig3" x={338} y={6} w={4} h={16} bg="var:text/inverse" flex="none" />
        <Frame name="bat" x={352} y={9} w={22} h={10} stroke="var:text/inverse" strokeWidth={1} flex="none" />
        <Frame name="batcap" x={374} y={12} w={2} h={4} bg="var:text/inverse" flex="none" />
      </Frame>
      <Text x={40} y={116} w={1320} h={24} size={24} color="var:text/primary">② Bar/Nav 导航栏 390×44</Text>
      <Frame name="Bar/Nav, action=none" x={40} y={152} w={390} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={390} h={44} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={43} w={390} h={1} bg="var:line/soft" flex="none" />
        <Frame name="chev1" x={12} y={16} w={10} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev2" x={10} y={18} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev3" x={14} y={20} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev4" x={12} y={22} w={10} h={2} bg="var:text/primary" flex="none" />
        <Text x={0} y={14} w={390} h={18} size={12} color="var:text/primary" align="center">任务详情</Text>
      </Frame>
      <Frame name="Bar/Nav, action=text" x={470} y={152} w={390} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={390} h={44} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={43} w={390} h={1} bg="var:line/soft" flex="none" />
        <Frame name="chev1" x={12} y={16} w={10} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev2" x={10} y={18} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev3" x={14} y={20} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev4" x={12} y={22} w={10} h={2} bg="var:text/primary" flex="none" />
        <Text x={0} y={14} w={390} h={18} size={12} color="var:text/primary" align="center">任务详情</Text>
        <Text x={330} y={14} w={48} h={18} size={12} color="var:accent/go" align="center">保存</Text>
      </Frame>
      <Frame name="Bar/Nav, action=icon" x={900} y={152} w={390} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={390} h={44} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={43} w={390} h={1} bg="var:line/soft" flex="none" />
        <Frame name="chev1" x={12} y={16} w={10} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev2" x={10} y={18} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev3" x={14} y={20} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="chev4" x={12} y={22} w={10} h={2} bg="var:text/primary" flex="none" />
        <Text x={0} y={14} w={390} h={18} size={12} color="var:text/primary" align="center">任务详情</Text>
        <Frame name="icon" x={352} y={14} w={16} h={16} stroke="var:text/primary" strokeWidth={2} flex="none" />
      </Frame>
      <Text x={40} y={228} w={1320} h={24} size={24} color="var:text/primary">③ Icon/Glyph 图标字形 16×16</Text>
      <Frame name="Icon/Glyph, name=menu" x={40} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={0} y={3} w={14} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={0} y={7} w={14} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={0} y={11} w={14} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={40} y={288} w={300} h={14} size={12} color="var:text/muted">menu</Text>
      <Frame name="Icon/Glyph, name=check" x={130} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={2} y={7} w={3} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={5} y={10} w={3} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={8} y={7} w={3} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b3" x={11} y={4} w={3} h={3} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={130} y={288} w={300} h={14} size={12} color="var:text/muted">check</Text>
      <Frame name="Icon/Glyph, name=tri-down" x={220} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={2} y={5} w={12} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={4} y={8} w={8} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={6} y={11} w={4} h={3} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={220} y={288} w={300} h={14} size={12} color="var:text/muted">tri-down</Text>
      <Frame name="Icon/Glyph, name=tri-up" x={310} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={6} y={2} w={4} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={4} y={5} w={8} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={2} y={8} w={12} h={3} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={310} y={288} w={300} h={14} size={12} color="var:text/muted">tri-up</Text>
      <Frame name="Icon/Glyph, name=arrow-right" x={400} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={1} y={7} w={9} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={9} y={4} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={11} y={6} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b3" x={9} y={10} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b4" x={11} y={8} w={2} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={400} y={288} w={300} h={14} size={12} color="var:text/muted">arrow-right</Text>
      <Frame name="Icon/Glyph, name=arrow-left" x={490} y={264} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={6} y={7} w={9} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={5} y={4} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={3} y={6} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b3" x={5} y={10} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b4" x={3} y={8} w={2} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={490} y={288} w={300} h={14} size={12} color="var:text/muted">arrow-left</Text>
      <Frame name="Icon/Glyph, name=play" x={40} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={4} y={3} w={3} h={10} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={7} y={5} w={3} h={6} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={10} y={7} w={3} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={40} y={366} w={300} h={14} size={12} color="var:text/muted">play</Text>
      <Frame name="Icon/Glyph, name=pause" x={130} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={4} y={3} w={3} h={10} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={9} y={3} w={3} h={10} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={130} y={366} w={300} h={14} size={12} color="var:text/muted">pause</Text>
      <Frame name="Icon/Glyph, name=plus" x={220} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={7} y={2} w={2} h={12} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={2} y={7} w={12} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={220} y={366} w={300} h={14} size={12} color="var:text/muted">plus</Text>
      <Frame name="Icon/Glyph, name=close" x={310} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={2} y={2} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={4} y={4} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={6} y={6} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b3" x={8} y={8} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b4" x={10} y={10} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b5" x={12} y={12} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b6" x={12} y={2} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b7" x={10} y={4} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b8" x={8} y={6} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b9" x={6} y={8} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b10" x={4} y={10} w={2} h={2} bg="var:text/primary" flex="none" />
        <Frame name="b11" x={2} y={12} w={2} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={310} y={366} w={300} h={14} size={12} color="var:text/muted">close</Text>
      <Frame name="Icon/Glyph, name=user" x={400} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={6} y={2} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={3} y={8} w={10} h={3} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={4} y={11} w={8} h={3} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={400} y={366} w={300} h={14} size={12} color="var:text/muted">user</Text>
      <Frame name="Icon/Glyph, name=gear" x={490} y={342} w={16} h={16} bg="var:bg/void" flex="none">
        <Frame name="b0" x={6} y={1} w={4} h={14} bg="var:text/primary" flex="none" />
        <Frame name="b1" x={1} y={6} w={14} h={4} bg="var:text/primary" flex="none" />
        <Frame name="b2" x={6} y={6} w={4} h={4} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={490} y={366} w={300} h={14} size={12} color="var:text/muted">gear</Text>
      <Text x={40} y={436} w={1320} h={24} size={24} color="var:text/primary">④ Icon/Btn 图标按钮 28×28</Text>
      <Frame name="Icon/Btn, state=normal" x={40} y={472} w={28} h={28} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={28} h={28} bg="var:bg/base" flex="none" />
        <Frame name="g0" x={8} y={9} w={12} h={2} bg="var:text/primary" flex="none" />
        <Frame name="g1" x={8} y={13} w={12} h={2} bg="var:text/primary" flex="none" />
        <Frame name="g2" x={8} y={17} w={12} h={2} bg="var:text/primary" flex="none" />
      </Frame>
      <Frame name="Icon/Btn, state=active" x={100} y={472} w={28} h={28} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={28} h={28} bg="var:line/strong" flex="none" />
        <Frame name="g0" x={8} y={9} w={12} h={2} bg="var:text/inverse" flex="none" />
        <Frame name="g1" x={8} y={13} w={12} h={2} bg="var:text/inverse" flex="none" />
        <Frame name="g2" x={8} y={17} w={12} h={2} bg="var:text/inverse" flex="none" />
      </Frame>
      <Frame name="Icon/Btn, state=disabled" x={160} y={472} w={28} h={28} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={28} h={28} bg="var:line/track" flex="none" />
        <Frame name="g0" x={8} y={9} w={12} h={2} bg="var:text/disabled" flex="none" />
        <Frame name="g1" x={8} y={13} w={12} h={2} bg="var:text/disabled" flex="none" />
        <Frame name="g2" x={8} y={17} w={12} h={2} bg="var:text/disabled" flex="none" />
      </Frame>
      <Text x={40} y={524} w={1320} h={24} size={24} color="var:text/primary">⑤ Field/Input 输入框 358×48</Text>
      <Frame name="Field/Input, state=normal" x={40} y={560} w={358} h={48} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={48} stroke="var:line/soft" strokeWidth={2} flex="none" />
        <Text x={12} y={15} w={300} h={18} size={12} color="var:text/muted">输入内容</Text>
      </Frame>
      <Frame name="Field/Input, state=focus" x={440} y={560} w={358} h={48} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={48} stroke="var:accent/confirm" strokeWidth={2} flex="none" />
        <Text x={12} y={15} w={300} h={18} size={12} color="var:text/primary">输入内容</Text>
      </Frame>
      <Frame name="Field/Input, state=disabled" x={40} y={626} w={358} h={48} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={48} bg="var:bg/sunken" stroke="var:line/track" strokeWidth={2} flex="none" />
        <Text x={12} y={15} w={300} h={18} size={12} color="var:text/disabled">输入内容</Text>
      </Frame>
      <Frame name="Field/Input, state=error" x={440} y={626} w={358} h={48} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={48} stroke="var:accent/stop" strokeWidth={2} flex="none" />
        <Text x={12} y={15} w={300} h={18} size={12} color="var:text/primary">输入内容</Text>
      </Frame>
      <Text x={40} y={700} w={1320} h={24} size={24} color="var:text/primary">⑥ Row/List 列表行 358×56</Text>
      <Frame name="Row/List, kind=normal" x={40} y={736} w={358} h={56} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={56} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={55} w={358} h={1} bg="var:line/soft" flex="none" />
        <Text x={12} y={19} w={200} h={18} size={12} color="var:text/primary">个人资料</Text>
        <Frame name="c1" x={42} y={12} w={10} h={2} bg="var:text/disabled" flex="none" />
        <Frame name="c2" x={44} y={14} w={2} h={2} bg="var:text/disabled" flex="none" />
        <Frame name="c3" x={46} y={16} w={2} h={2} bg="var:text/disabled" flex="none" />
        <Frame name="c4" x={44} y={18} w={6} h={2} bg="var:text/disabled" flex="none" />
      </Frame>
      <Frame name="Row/List, kind=toggle" x={440} y={736} w={358} h={56} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={56} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={55} w={358} h={1} bg="var:line/soft" flex="none" />
        <Text x={12} y={19} w={200} h={18} size={12} color="var:text/primary">提醒通知</Text>
        <Frame name="tbg" x={302} y={16} w={44} h={24} bg="var:accent/go-deep" flex="none" />
        <Frame name="knob" x={324} y={18} w={20} h={20} bg="var:text/primary" flex="none" />
      </Frame>
      <Frame name="Row/List, kind=value" x={40} y={802} w={358} h={56} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={56} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={55} w={358} h={1} bg="var:line/soft" flex="none" />
        <Text x={12} y={19} w={200} h={18} size={12} color="var:text/primary">目标名称</Text>
        <Text x={240} y={19} w={106} h={18} size={12} color="var:text/secondary" align="right">8 周力量</Text>
      </Frame>
      <Frame name="Row/List, kind=danger" x={440} y={802} w={358} h={56} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={56} bg="var:bg/base" flex="none" />
        <Frame name="line" x={0} y={55} w={358} h={1} bg="var:line/soft" flex="none" />
        <Text x={12} y={19} w={200} h={18} size={12} color="var:accent/stop">归档机构</Text>
      </Frame>
      <Text x={40} y={880} w={1320} h={24} size={24} color="var:text/primary">⑦ Ctrl/Toggle 开关 44×24</Text>
      <Frame name="Ctrl/Toggle, on=true" x={40} y={916} w={44} h={24} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={44} h={24} bg="var:accent/go-deep" flex="none" />
        <Frame name="knob" x={22} y={2} w={20} h={20} bg="var:text/primary" flex="none" />
      </Frame>
      <Frame name="Ctrl/Toggle, on=false" x={140} y={916} w={44} h={24} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={44} h={24} bg="var:line/track" flex="none" />
        <Frame name="knob" x={2} y={2} w={20} h={20} bg="var:text/primary" flex="none" />
      </Frame>
      <Text x={40} y={976} w={1320} h={24} size={24} color="var:text/primary">⑧ Ctrl/Check 勾选框 24×24</Text>
      <Frame name="Ctrl/Check, on=true" x={40} y={1012} w={24} h={24} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={24} h={24} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="k1" x={4} y={10} w={4} h={4} bg="var:text/inverse" flex="none" />
        <Frame name="k2" x={8} y={14} w={4} h={4} bg="var:text/inverse" flex="none" />
        <Frame name="k3" x={12} y={10} w={4} h={4} bg="var:text/inverse" flex="none" />
        <Frame name="k4" x={16} y={6} w={4} h={4} bg="var:text/inverse" flex="none" />
      </Frame>
      <Frame name="Ctrl/Check, on=false" x={100} y={1012} w={24} h={24} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={24} h={24} stroke="var:line/soft" strokeWidth={2} flex="none" />
      </Frame>
      <Text x={40} y={1072} w={1320} h={24} size={24} color="var:text/primary">⑨ Ctrl/Slider 滑杆 358×24</Text>
      <Frame name="Ctrl/Slider, state=normal" x={40} y={1108} w={358} h={24} bg="var:bg/void" flex="none">
        <Frame name="track" x={0} y={9} w={358} h={6} bg="var:line/track" flex="none" />
        <Frame name="fill" x={0} y={9} w={143} h={6} bg="var:text/primary" flex="none" />
        <Frame name="knob" x={135} y={0} w={16} h={24} bg="var:text/primary" flex="none" />
      </Frame>
      <Frame name="Ctrl/Slider, state=disabled" x={440} y={1108} w={358} h={24} bg="var:bg/void" flex="none">
        <Frame name="track" x={0} y={9} w={358} h={6} bg="var:line/track" flex="none" />
        <Frame name="fill" x={0} y={9} w={143} h={6} bg="var:text/disabled" flex="none" />
        <Frame name="knob" x={135} y={0} w={16} h={24} bg="var:text/disabled" flex="none" />
      </Frame>
      <Text x={40} y={1168} w={1320} h={24} size={24} color="var:text/primary">⑩ Chip/Filter 筛选芯片 88×32</Text>
      <Frame name="Chip/Filter, on=true" x={40} y={1204} w={88} h={32} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={88} h={32} bg="var:line/strong" flex="none" />
        <Text x={0} y={8} w={88} h={18} size={12} color="var:text/inverse" align="center">体能署</Text>
      </Frame>
      <Frame name="Chip/Filter, on=false" x={160} y={1204} w={88} h={32} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={88} h={32} bg="var:bg/base" stroke="var:line/soft" strokeWidth={2} flex="none" />
        <Text x={0} y={8} w={88} h={18} size={12} color="var:text/secondary" align="center">体能署</Text>
      </Frame>
      <Text x={40} y={1264} w={1320} h={24} size={24} color="var:text/primary">⑪ Block/Ring 进度环 260×260</Text>
      <Frame name="Block/Ring, state=idle" x={40} y={1300} w={260} h={260} bg="var:bg/void" flex="none">
        <Frame name="outer" x={0} y={0} w={260} h={260} bg="var:bg/base" stroke="var:line/track" strokeWidth={2} radius={130} flex="none" />
        <Frame name="inner" x={24} y={24} w={212} h={212} bg="var:bg/void" radius={106} flex="none" />
        <Text x={0} y={112} w={260} h={34} size={36} color="var:text/primary" align="center">25:00</Text>
      </Frame>
      <Frame name="Block/Ring, state=running" x={330} y={1300} w={260} h={260} bg="var:bg/void" flex="none">
        <Frame name="outer" x={0} y={0} w={260} h={260} bg="var:bg/base" stroke="var:line/track" strokeWidth={2} radius={130} flex="none" />
        <Frame name="prog" x={6} y={6} w={248} h={248} bg="var:accent/warn" radius={124} flex="none" />
        <Frame name="inner" x={24} y={24} w={212} h={212} bg="var:bg/void" radius={106} flex="none" />
        <Text x={0} y={112} w={260} h={34} size={36} color="var:text/primary" align="center">25:00</Text>
      </Frame>
      <Frame name="Block/Ring, state=done" x={620} y={1300} w={260} h={260} bg="var:bg/void" flex="none">
        <Frame name="outer" x={0} y={0} w={260} h={260} bg="var:bg/base" stroke="var:line/track" strokeWidth={2} radius={130} flex="none" />
        <Frame name="prog" x={6} y={6} w={248} h={248} bg="var:accent/go" radius={124} flex="none" />
        <Frame name="inner" x={24} y={24} w={212} h={212} bg="var:bg/void" radius={106} flex="none" />
        <Text x={0} y={112} w={260} h={34} size={36} color="var:text/primary" align="center">25:00</Text>
      </Frame>
      <Text x={40} y={1600} w={1320} h={24} size={24} color="var:text/primary">⑫ Card/Event 事件卡 358×120</Text>
      <Frame name="Card/Event, kind=text" x={40} y={1636} w={358} h={120} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={120} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={12} y={14} w={220} h={20} size={12} color="var:text/primary">事件：XXXXX</Text>
        <Text x={12} y={40} w={300} h={18} size={12} color="var:text/secondary">详细内容：XXXXXXXXXX</Text>
        <Frame name="circle" x={288} y={68} w={26} h={26} bg="var:bg/raise" radius={13} flex="none" />
        <Frame name="playbtn" x={322} y={68} w={24} h={26} bg="var:line/strong" flex="none" />
        <Frame name="p1" x={329} y={74} w={4} h={14} bg="var:text/inverse" flex="none" />
        <Frame name="p2" x={333} y={77} w={4} h={8} bg="var:text/inverse" flex="none" />
        <Frame name="p3" x={337} y={80} w={4} h={2} bg="var:text/inverse" flex="none" />
      </Frame>
      <Frame name="Card/Event, kind=media" x={440} y={1636} w={358} h={120} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={120} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={12} y={14} w={220} h={20} size={12} color="var:text/primary">事件：XXXXX</Text>
        <Text x={12} y={40} w={300} h={18} size={12} color="var:text/secondary">详细内容：XXXXXXXXXX</Text>
        <Frame name="thumb" x={12} y={68} w={60} h={40} bg="var:bg/raise" flex="none" />
        <Frame name="circle" x={288} y={68} w={26} h={26} bg="var:bg/raise" radius={13} flex="none" />
        <Frame name="playbtn" x={322} y={68} w={24} h={26} bg="var:line/strong" flex="none" />
        <Frame name="p1" x={329} y={74} w={4} h={14} bg="var:text/inverse" flex="none" />
        <Frame name="p2" x={333} y={77} w={4} h={8} bg="var:text/inverse" flex="none" />
        <Frame name="p3" x={337} y={80} w={4} h={2} bg="var:text/inverse" flex="none" />
      </Frame>
      <Text x={40} y={1780} w={1320} h={24} size={24} color="var:text/primary">⑬ Card/Program 计划卡 358×88</Text>
      <Frame name="Card/Program, state=active" x={40} y={1816} w={358} h={88} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={88} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={12} y={14} w={220} h={20} size={12} color="var:text/primary">8 周力量</Text>
        <Frame name="dot" x={300} y={16} w={10} h={10} bg="var:accent/go" flex="none" />
        <Text x={240} y={14} w={56} h={18} size={12} color="var:text/secondary" align="right">进行中</Text>
        <Frame name="ptrack" x={12} y={46} w={334} h={8} bg="var:line/track" flex="none" />
        <Frame name="pfill" x={12} y={46} w={140} h={8} bg="var:text/primary" flex="none" />
        <Text x={12} y={62} w={200} h={16} size={12} color="var:text/secondary">第 5 / 24 格</Text>
      </Frame>
      <Frame name="Card/Program, state=paused" x={440} y={1816} w={358} h={88} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={88} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={12} y={14} w={220} h={20} size={12} color="var:text/primary">8 周力量</Text>
        <Frame name="dot" x={300} y={16} w={10} h={10} bg="var:text/disabled" flex="none" />
        <Text x={240} y={14} w={56} h={18} size={12} color="var:text/secondary" align="right">已暂停</Text>
        <Frame name="ptrack" x={12} y={46} w={334} h={8} bg="var:line/track" flex="none" />
        <Frame name="pfill" x={12} y={46} w={140} h={8} bg="var:text/primary" flex="none" />
        <Text x={12} y={62} w={200} h={16} size={12} color="var:text/secondary">第 5 / 24 格</Text>
      </Frame>
      <Frame name="Card/Program, state=done" x={840} y={1816} w={358} h={88} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={88} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={12} y={14} w={220} h={20} size={12} color="var:text/primary">8 周力量</Text>
        <Frame name="dot" x={300} y={16} w={10} h={10} bg="var:accent/confirm" flex="none" />
        <Text x={240} y={14} w={56} h={18} size={12} color="var:text/secondary" align="right">已完成</Text>
        <Frame name="ptrack" x={12} y={46} w={334} h={8} bg="var:line/track" flex="none" />
        <Frame name="pfill" x={12} y={46} w={334} h={8} bg="var:text/primary" flex="none" />
        <Text x={12} y={62} w={200} h={16} size={12} color="var:text/secondary">第 5 / 24 格</Text>
      </Frame>
      <Text x={40} y={1936} w={1320} h={24} size={24} color="var:text/primary">⑭ Card/Facility 设施卡 358×92</Text>
      <Frame name="Card/Facility, state=building" x={40} y={1972} w={358} h={92} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={92} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="thumb" x={12} y={14} w={64} h={64} bg="var:bg/raise" flex="none" />
        <Text x={88} y={20} w={200} h={20} size={12} color="var:text/primary">体能署</Text>
        <Frame name="dot" x={88} y={46} w={10} h={10} bg="var:accent/warn" flex="none" />
        <Text x={104} y={44} w={100} h={16} size={12} color="var:text/secondary">营建中</Text>
        <Text x={88} y={64} w={254} h={16} size={12} color="var:text/secondary">I2 · 8 周力量 · 第 5/24 格</Text>
      </Frame>
      <Frame name="Card/Facility, state=running" x={440} y={1972} w={358} h={92} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={92} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="thumb" x={12} y={14} w={64} h={64} bg="var:bg/raise" flex="none" />
        <Text x={88} y={20} w={200} h={20} size={12} color="var:text/primary">体能署</Text>
        <Frame name="dot" x={88} y={46} w={10} h={10} bg="var:accent/go" flex="none" />
        <Text x={104} y={44} w={100} h={16} size={12} color="var:text/secondary">在营</Text>
        <Text x={88} y={64} w={254} h={16} size={12} color="var:text/secondary">I2 · 8 周力量 · 第 5/24 格</Text>
      </Frame>
      <Frame name="Card/Facility, state=idle" x={40} y={2076} w={358} h={92} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={92} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="thumb" x={12} y={14} w={64} h={64} bg="var:bg/raise" flex="none" />
        <Text x={88} y={20} w={200} h={20} size={12} color="var:text/primary">体能署</Text>
        <Frame name="dot" x={88} y={46} w={10} h={10} bg="var:text/disabled" flex="none" />
        <Text x={104} y={44} w={100} h={16} size={12} color="var:text/secondary">巡航</Text>
        <Text x={88} y={64} w={254} h={16} size={12} color="var:text/secondary">I2 · 8 周力量 · 第 5/24 格</Text>
      </Frame>
      <Frame name="Card/Facility, state=parked" x={440} y={2076} w={358} h={92} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={92} bg="var:bg/void" stroke="var:line/track" strokeWidth={2} flex="none" />
        <Frame name="thumb" x={12} y={14} w={64} h={64} bg="var:bg/raise" flex="none" />
        <Text x={88} y={20} w={200} h={20} size={12} color="var:text/muted">体能署</Text>
        <Frame name="dot" x={88} y={46} w={10} h={10} bg="var:text/muted" flex="none" />
        <Text x={104} y={44} w={100} h={16} size={12} color="var:text/secondary">停机</Text>
        <Text x={88} y={64} w={254} h={16} size={12} color="var:text/secondary">I2 · 8 周力量 · 第 5/24 格</Text>
      </Frame>
      <Text x={40} y={2200} w={1320} h={24} size={24} color="var:text/primary">⑮ Panel/Dialog 弹层 326×200</Text>
      <Frame name="Panel/Dialog, kind=confirm" x={40} y={2236} w={326} h={200} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={326} h={200} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={16} y={20} w={294} h={22} size={24} color="var:text/primary">标题</Text>
        <Text x={16} y={56} w={294} h={40} size={12} color="var:text/secondary">说明文字，最多两行。</Text>
        <Frame name="cancel" x={16} y={130} w={140} h={40} stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={16} y={141} w={140} h={18} size={12} color="var:text/secondary" align="center">取消</Text>
        <Frame name="ok" x={170} y={130} w={140} h={40} bg="var:accent/go-deep" flex="none" />
        <Text x={170} y={141} w={140} h={18} size={12} color="var:text/inverse" align="center">确认</Text>
      </Frame>
      <Frame name="Panel/Dialog, kind=alert" x={410} y={2236} w={326} h={200} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={326} h={200} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={16} y={20} w={294} h={22} size={24} color="var:text/primary">标题</Text>
        <Text x={16} y={56} w={294} h={40} size={12} color="var:text/secondary">说明文字，最多两行。</Text>
        <Frame name="cancel" x={16} y={130} w={140} h={40} stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={16} y={141} w={140} h={18} size={12} color="var:text/secondary" align="center">取消</Text>
        <Frame name="ok" x={170} y={130} w={140} h={40} bg="var:line/strong" flex="none" />
        <Text x={170} y={141} w={140} h={18} size={12} color="var:text/inverse" align="center">知道了</Text>
      </Frame>
      <Text x={40} y={2464} w={1320} h={24} size={24} color="var:text/primary">⑯ State/Page 空/错误状态 358×240</Text>
      <Frame name="State/Page, kind=empty" x={40} y={2500} w={358} h={240} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={240} bg="var:bg/base" stroke="var:line/soft" strokeWidth={1} flex="none" />
        <Frame name="glyph" x={167} y={40} w={24} h={24} stroke="var:text/disabled" strokeWidth={2} flex="none" />
        <Text x={0} y={84} w={358} h={24} size={24} color="var:text/primary" align="center">还没有记录</Text>
        <Text x={0} y={116} w={358} h={18} size={12} color="var:text/secondary" align="center">今天完成一次，趋势就会长出来。</Text>
        <Frame name="btn" x={103} y={160} w={152} h={40} stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={103} y={171} w={152} h={18} size={12} color="var:text/primary" align="center">去打卡</Text>
      </Frame>
      <Frame name="State/Page, kind=error" x={440} y={2500} w={358} h={240} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={358} h={240} bg="var:bg/base" stroke="var:line/soft" strokeWidth={1} flex="none" />
        <Frame name="glyph" x={167} y={40} w={24} h={24} stroke="var:text/disabled" strokeWidth={2} flex="none" />
        <Text x={0} y={84} w={358} h={24} size={24} color="var:text/primary" align="center">记录没同步上</Text>
        <Text x={0} y={116} w={358} h={18} size={12} color="var:text/secondary" align="center">本地这份还在。</Text>
        <Frame name="btn" x={103} y={160} w={152} h={40} stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Text x={103} y={171} w={152} h={18} size={12} color="var:text/primary" align="center">重试</Text>
      </Frame>
      <Text x={40} y={2780} w={1320} h={24} size={24} color="var:text/primary">⑰ Toast 轻提示 326×44</Text>
      <Frame name="Toast, kind=info" x={40} y={2816} w={326} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={326} h={44} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="dot" x={14} y={17} w={10} h={10} bg="var:text/secondary" flex="none" />
        <Text x={34} y={13} w={278} h={18} size={12} color="var:text/primary">记下了。+20 XP</Text>
      </Frame>
      <Frame name="Toast, kind=success" x={410} y={2816} w={326} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={326} h={44} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="dot" x={14} y={17} w={10} h={10} bg="var:accent/go" flex="none" />
        <Text x={34} y={13} w={278} h={18} size={12} color="var:text/primary">记下了。+20 XP</Text>
      </Frame>
      <Frame name="Toast, kind=warn" x={780} y={2816} w={326} h={44} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={326} h={44} bg="var:bg/base" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="dot" x={14} y={17} w={10} h={10} bg="var:accent/warn" flex="none" />
        <Text x={34} y={13} w={278} h={18} size={12} color="var:text/primary">记下了。+20 XP</Text>
      </Frame>
      <Text x={40} y={2900} w={1320} h={24} size={24} color="var:text/primary">⑱ Avatar 头像 64×64</Text>
      <Frame name="Avatar, shape=square" x={40} y={2936} w={64} h={64} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={64} h={64} bg="var:bg/raise" stroke="var:line/strong" strokeWidth={2} flex="none" />
        <Frame name="head" x={22} y={14} w={20} h={20} bg="var:text/disabled" radius={10} flex="none" />
        <Frame name="body" x={14} y={40} w={36} h={16} bg="var:text/disabled" radius={4} flex="none" />
      </Frame>
      <Frame name="Avatar, shape=circle" x={140} y={2936} w={64} h={64} bg="var:bg/void" flex="none">
        <Frame name="bg" x={0} y={0} w={64} h={64} bg="var:bg/raise" stroke="var:line/strong" strokeWidth={2} radius={32} flex="none" />
        <Frame name="head" x={22} y={14} w={20} h={20} bg="var:text/disabled" radius={10} flex="none" />
        <Frame name="body" x={14} y={40} w={36} h={16} bg="var:text/disabled" radius={4} flex="none" />
      </Frame>
      <Text x={40} y={3040} w={1320} h={24} size={24} color="var:text/primary">⑲ Bar/Progress · 新增 style=stripe</Text>
      <Frame name="Bar/Progress, style=stripe" x={40} y={3076} w={358} h={12} bg="var:bg/void" flex="none">
        <Frame name="s0_0" x={0} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_1" x={8} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_2" x={16} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_3" x={24} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_4" x={32} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_5" x={40} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_6" x={48} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_7" x={56} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_8" x={64} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_9" x={72} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_10" x={80} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_11" x={88} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_12" x={96} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_13" x={104} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_14" x={112} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_15" x={120} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_16" x={128} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_17" x={136} y={0} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s0_18" x={144} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_19" x={152} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_20" x={160} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_21" x={168} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_22" x={176} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_23" x={184} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_24" x={192} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_25" x={200} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_26" x={208} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_27" x={216} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_28" x={224} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_29" x={232} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_30" x={240} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_31" x={248} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_32" x={256} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_33" x={264} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_34" x={272} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_35" x={280} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_36" x={288} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_37" x={296} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_38" x={304} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_39" x={312} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_40" x={320} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_41" x={328} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_42" x={336} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_43" x={344} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s0_44" x={352} y={0} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_0" x={4} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_1" x={12} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_2" x={20} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_3" x={28} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_4" x={36} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_5" x={44} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_6" x={52} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_7" x={60} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_8" x={68} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_9" x={76} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_10" x={84} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_11" x={92} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_12" x={100} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_13" x={108} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_14" x={116} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_15" x={124} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_16" x={132} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_17" x={140} y={4} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s1_18" x={148} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_19" x={156} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_20" x={164} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_21" x={172} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_22" x={180} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_23" x={188} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_24" x={196} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_25" x={204} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_26" x={212} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_27" x={220} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_28" x={228} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_29" x={236} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_30" x={244} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_31" x={252} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_32" x={260} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_33" x={268} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_34" x={276} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_35" x={284} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_36" x={292} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_37" x={300} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_38" x={308} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_39" x={316} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_40" x={324} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_41" x={332} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_42" x={340} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s1_43" x={348} y={4} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_0" x={8} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_1" x={16} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_2" x={24} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_3" x={32} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_4" x={40} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_5" x={48} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_6" x={56} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_7" x={64} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_8" x={72} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_9" x={80} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_10" x={88} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_11" x={96} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_12" x={104} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_13" x={112} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_14" x={120} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_15" x={128} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_16" x={136} y={8} w={4} h={4} bg="var:text/primary" flex="none" />
        <Frame name="s2_17" x={144} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_18" x={152} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_19" x={160} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_20" x={168} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_21" x={176} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_22" x={184} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_23" x={192} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_24" x={200} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_25" x={208} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_26" x={216} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_27" x={224} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_28" x={232} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_29" x={240} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_30" x={248} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_31" x={256} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_32" x={264} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_33" x={272} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_34" x={280} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_35" x={288} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_36" x={296} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_37" x={304} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_38" x={312} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_39" x={320} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_40" x={328} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_41" x={336} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_42" x={344} y={8} w={4} h={4} bg="var:line/track" flex="none" />
        <Frame name="s2_43" x={352} y={8} w={4} h={4} bg="var:line/track" flex="none" />
      </Frame>
      </Frame>