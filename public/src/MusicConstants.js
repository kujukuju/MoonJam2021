class MusicConstants {
    static BASE = 1;
    static VOLUME = 0.1;
    static CALIBRATION_OFFSET = (window.localStorage.getItem('calibration') ? Number.parseFloat(window.localStorage.getItem('calibration')) : -20) ?? -20;

    static MAIN_SONG_1_LABELS = `0.034620\t0.034620\tbpm125`;
    static TRANSITION_1_LABELS = `0.068200\t0.068200\tbpm125
0.548083\t0.548083\tbat
0.822045\t0.822045\tbat
1.195558\t1.195558\tbat
1.513617\t1.513617\tbat
1.999224\t1.999224\tbat
2.462112\t2.462112\tbat
2.720534\t2.720534\tbat
3.112428\t3.112428\tbat
3.436166\t3.436166\tbat
3.680389\t3.680389\tbat
3.913253\t3.913253\tbat
4.387501\t4.387501\tbat
4.787913\t4.787913\tbat
5.111651\t5.111651\tbat
5.353035\t5.353035\tbat
5.832962\t5.832962\tbat
6.082865\t6.082865\tbat
6.312889\t6.312889\tbat
6.561372\t6.561372\tbat
6.792817\t6.792817\tbat
7.277004\t7.277004\tbat
7.512708\t7.512708\tbat
7.751251\t7.751251\tbat
8.225499\t8.225499\tbat
8.471142\t8.471142\tbat
8.865875\t8.865875\tbat
9.193873\t9.193873\tbat
9.669540\t9.669540\tbat
10.131009\t10.131009\tbat
10.389504\t10.389504\tbat
10.796457\t10.796457\tbat
11.117950\t11.117950\tbat
11.366191\t11.366191\tbat
11.598154\t11.598154\tbat
12.074289\t12.074289\tbat
12.456825\t12.456825\tbat
12.790526\t12.790526\tbat
13.201548\t13.201548\tbat
13.506763\t13.506763\tbat
13.771282\t13.771282\tbat
13.978828\t13.978828\tbat
14.231139\t14.231139\tbat
14.463102\t14.463102\tbat
14.703204\t14.703204\tbat
14.939237\t14.939237\tbat
15.191547\t15.191547\tbat
15.415371\t15.415371\tbat
15.895254\t15.895254\tbat
16.169216\t16.169216\tbat
16.542730\t16.542730\tbat
16.860788\t16.860788\tbat
17.346395\t17.346395\tbat
17.809283\t17.809283\tbat
18.067706\t18.067706\tbat
18.459599\t18.459599\tbat
18.783337\t18.783337\tbat
19.027560\t19.027560\tbat
19.260424\t19.260424\tbat
19.734672\t19.734672\tbat
20.135085\t20.135085\tbat
20.458823\t20.458823\tbat
20.700206\t20.700206\tbat
21.180133\t21.180133\tbat
21.430036\t21.430036\tbat
21.660061\t21.660061\tbat
21.908544\t21.908544\tbat
22.139988\t22.139988\tbat
22.624175\t22.624175\tbat
22.859879\t22.859879\tbat
23.098422\t23.098422\tbat
23.572670\t23.572670\tbat
23.818313\t23.818313\tbat
24.213046\t24.213046\tbat
24.541044\t24.541044\tbat
25.016712\t25.016712\tbat
25.478180\t25.478180\tbat
25.736676\t25.736676\tbat
26.143628\t26.143628\tbat
26.465121\t26.465121\tbat
26.713362\t26.713362\tbat
26.945325\t26.945325\tbat
27.421460\t27.421460\tbat
27.803996\t27.803996\tbat
28.137697\t28.137697\tbat
28.548719\t28.548719\tbat
28.853934\t28.853934\tbat
29.118453\t29.118453\tbat
29.325999\t29.325999\tbat
29.578310\t29.578310\tbat
29.810273\t29.810273\tbat
30.050375\t30.050375\tbat
30.286408\t30.286408\tbat
30.538718\t30.538718\tbat
30.795099\t30.795099\tbat
31.274981\t31.274981\tbat
31.548943\t31.548943\tbat
31.922457\t31.922457\tbat
32.240515\t32.240515\tbat
32.726122\t32.726122\tbat
33.189011\t33.189011\tbat
33.447433\t33.447433\tbat
33.839326\t33.839326\tbat
34.163064\t34.163064\tbat
34.407287\t34.407287\tbat
34.640152\t34.640152\tbat
35.114399\t35.114399\tbat
35.514812\t35.514812\tbat
35.838550\t35.838550\tbat
36.079933\t36.079933\tbat
36.559861\t36.559861\tbat
36.809764\t36.809764\tbat
37.039788\t37.039788\tbat
37.288271\t37.288271\tbat
37.519715\t37.519715\tbat
38.003902\t38.003902\tbat
38.239606\t38.239606\tbat
38.478150\t38.478150\tbat
38.952397\t38.952397\tbat
39.198041\t39.198041\tbat
39.592774\t39.592774\tbat
39.920771\t39.920771\tbat
40.396439\t40.396439\tbat
40.857908\t40.857908\tbat
41.116403\t41.116403\tbat
41.523356\t41.523356\tbat
41.844848\t41.844848\tbat
42.093090\t42.093090\tbat
42.325053\t42.325053\tbat
42.801187\t42.801187\tbat
43.183723\t43.183723\tbat
43.517424\t43.517424\tbat
43.928447\t43.928447\tbat
44.233661\t44.233661\tbat
44.498181\t44.498181\tbat
44.705726\t44.705726\tbat
44.958037\t44.958037\tbat
45.190000\t45.190000\tbat
45.430102\t45.430102\tbat
45.666135\t45.666135\tbat
45.918446\t45.918446\tbat
46.146339\t46.146339\tbat
46.626222\t46.626222\tbat
46.900184\t46.900184\tbat
47.273698\t47.273698\tbat
47.591756\t47.591756\tbat
48.077363\t48.077363\tbat
48.540251\t48.540251\tbat
48.798674\t48.798674\tbat
49.190567\t49.190567\tbat
49.514305\t49.514305\tbat
49.758528\t49.758528\tbat
49.991392\t49.991392\tbat
50.465640\t50.465640\tbat
50.866053\t50.866053\tbat
51.189791\t51.189791\tbat
51.431174\t51.431174\tbat
51.911101\t51.911101\tbat
52.161004\t52.161004\tbat
52.391029\t52.391029\tbat
52.639512\t52.639512\tbat
52.870956\t52.870956\tbat
53.355143\t53.355143\tbat
53.590847\t53.590847\tbat
53.829391\t53.829391\tbat
54.303638\t54.303638\tbat
54.549281\t54.549281\tbat
54.944014\t54.944014\tbat
55.272012\t55.272012\tbat
55.747680\t55.747680\tbat
56.209148\t56.209148\tbat
56.467644\t56.467644\tbat
56.874596\t56.874596\tbat
57.196089\t57.196089\tbat
57.444330\t57.444330\tbat
57.676293\t57.676293\tbat
58.152428\t58.152428\tbat
58.534964\t58.534964\tbat
58.868665\t58.868665\tbat
59.279687\t59.279687\tbat
59.584902\t59.584902\tbat
59.849421\t59.849421\tbat
60.056967\t60.056967\tbat
60.309278\t60.309278\tbat
60.541241\t60.541241\tbat
60.781343\t60.781343\tbat
61.017376\t61.017376\tbat
61.269686\t61.269686\tbat
61.505719\t61.505719\tbat
61.985602\t61.985602\tbat
62.259564\t62.259564\tbat
62.633077\t62.633077\tbat
62.951136\t62.951136\tbat
63.436743\t63.436743\tbat
63.899631\t63.899631\tbat
64.158053\t64.158053\tbat
64.549947\t64.549947\tbat
64.873685\t64.873685\tbat
65.117908\t65.117908\tbat
65.350772\t65.350772\tbat
65.825020\t65.825020\tbat
66.225432\t66.225432\tbat
66.549170\t66.549170\tbat
66.790554\t66.790554\tbat
67.270481\t67.270481\tbat
67.520384\t67.520384\tbat
67.750408\t67.750408\tbat
67.998891\t67.998891\tbat
68.230336\t68.230336\tbat
68.714523\t68.714523\tbat
68.950226\t68.950226\tbat
69.188770\t69.188770\tbat
69.663018\t69.663018\tbat
69.908661\t69.908661\tbat
70.303394\t70.303394\tbat
70.631392\t70.631392\tbat
71.107059\t71.107059\tbat
71.568528\t71.568528\tbat
71.827023\t71.827023\tbat
72.233976\t72.233976\tbat
72.555469\t72.555469\tbat
72.803710\t72.803710\tbat
73.035673\t73.035673\tbat
73.511808\t73.511808\tbat
73.894343\t73.894343\tbat
74.228045\t74.228045\tbat
74.639067\t74.639067\tbat
74.944282\t74.944282\tbat
75.208801\t75.208801\tbat
75.416347\t75.416347\tbat
75.668658\t75.668658\tbat
75.900621\t75.900621\tbat
76.140723\t76.140723\tbat
76.376755\t76.376755\tbat
76.629066\t76.629066\tbat
76.871274\t76.871274\tbat
77.351157\t77.351157\tbat
77.625119\t77.625119\tbat
77.998632\t77.998632\tbat
78.316691\t78.316691\tbat
78.802298\t78.802298\tbat
79.265186\t79.265186\tbat
79.523608\t79.523608\tbat
79.915502\t79.915502\tbat
80.239240\t80.239240\tbat
80.483463\t80.483463\tbat
80.716327\t80.716327\tbat
81.190575\t81.190575\tbat
81.590987\t81.590987\tbat
81.914725\t81.914725\tbat
82.156109\t82.156109\tbat
82.636036\t82.636036\tbat
82.885939\t82.885939\tbat
83.115963\t83.115963\tbat
83.364447\t83.364447\tbat
83.595891\t83.595891\tbat
84.080078\t84.080078\tbat
84.315782\t84.315782\tbat
84.554325\t84.554325\tbat
85.028573\t85.028573\tbat
85.274216\t85.274216\tbat
85.668949\t85.668949\tbat
85.996947\t85.996947\tbat
86.472615\t86.472615\tbat
86.934083\t86.934083\tbat
87.192578\t87.192578\tbat
87.599531\t87.599531\tbat
87.921024\t87.921024\tbat
88.169265\t88.169265\tbat
88.401228\t88.401228\tbat
88.877363\t88.877363\tbat
89.259899\t89.259899\tbat
89.593600\t89.593600\tbat
90.004622\t90.004622\tbat
90.309837\t90.309837\tbat
90.574356\t90.574356\tbat
90.781902\t90.781902\tbat
91.034213\t91.034213\tbat
91.266176\t91.266176\tbat
91.506278\t91.506278\tbat
91.742311\t91.742311\tbat
91.994621\t91.994621\tbat
92.230654\t92.230654\tbat
92.710536\t92.710536\tbat
92.984498\t92.984498\tbat
93.358012\t93.358012\tbat
93.676071\t93.676071\tbat
94.161677\t94.161677\tbat
94.624566\t94.624566\tbat
94.882988\t94.882988\tbat
95.274881\t95.274881\tbat
95.598619\t95.598619\tbat
95.842843\t95.842843\tbat
96.075707\t96.075707\tbat
96.549954\t96.549954\tbat
96.950367\t96.950367\tbat
97.274105\t97.274105\tbat
97.515489\t97.515489\tbat
97.995416\t97.995416\tbat
98.245319\t98.245319\tbat
98.475343\t98.475343\tbat
98.723826\t98.723826\tbat
98.955270\t98.955270\tbat
99.439457\t99.439457\tbat
99.675161\t99.675161\tbat
99.913705\t99.913705\tbat
100.387953\t100.387953\tbat
100.633596\t100.633596\tbat
101.028329\t101.028329\tbat
101.356327\t101.356327\tbat
101.831994\t101.831994\tbat
102.293463\t102.293463\tbat
102.551958\t102.551958\tbat
102.958911\t102.958911\tbat
103.280404\t103.280404\tbat
103.528645\t103.528645\tbat
103.760608\t103.760608\tbat
104.236743\t104.236743\tbat
104.619278\t104.619278\tbat
104.952980\t104.952980\tbat
105.364002\t105.364002\tbat
105.669216\t105.669216\tbat
105.933736\t105.933736\tbat
106.141282\t106.141282\tbat
106.393592\t106.393592\tbat
106.625556\t106.625556\tbat
106.865658\t106.865658\tbat
107.101690\t107.101690\tbat
107.354001\t107.354001\tbat
107.585964\t107.585964\tbat
108.065847\t108.065847\tbat
108.339809\t108.339809\tbat
108.713322\t108.713322\tbat
109.031381\t109.031381\tbat
109.516988\t109.516988\tbat
109.979876\t109.979876\tbat
110.238298\t110.238298\tbat
110.630192\t110.630192\tbat
110.953930\t110.953930\tbat
111.198153\t111.198153\tbat
111.431017\t111.431017\tbat
111.905265\t111.905265\tbat
112.305677\t112.305677\tbat
112.629415\t112.629415\tbat
112.870799\t112.870799\tbat
113.350726\t113.350726\tbat
113.600629\t113.600629\tbat
113.830653\t113.830653\tbat
114.079136\t114.079136\tbat
114.310581\t114.310581\tbat
114.794768\t114.794768\tbat
115.030472\t115.030472\tbat
115.269015\t115.269015\tbat
115.743263\t115.743263\tbat
115.988906\t115.988906\tbat
116.383639\t116.383639\tbat
116.711637\t116.711637\tbat
117.187304\t117.187304\tbat
117.648773\t117.648773\tbat
117.907268\t117.907268\tbat
118.314221\t118.314221\tbat
118.635714\t118.635714\tbat
118.883955\t118.883955\tbat
119.115918\t119.115918\tbat
119.592053\t119.592053\tbat
119.974589\t119.974589\tbat
120.308290\t120.308290\tbat
120.719312\t120.719312\tbat
121.024527\t121.024527\tbat
121.289046\t121.289046\tbat
121.496592\t121.496592\tbat
121.748903\t121.748903\tbat
121.980866\t121.980866\tbat
122.220968\t122.220968\tbat
122.457000\t122.457000\tbat
122.709311\t122.709311\tbat
122.933135\t122.933135\tbat`;

    static NO_LABELS = ``;

    // static CALIBRATION_HOWL = new Howl({src: 'assets/samplebeat.wav', volume: MusicConstants.VOLUME});

    static ROOMS = {
        'none': [],
        'calibration': [
            new Howl({src: 'assets/samplebeat.wav', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.NO_LABELS,
        ],
        'title': [
            new Howl({src: 'assets/title-110bpm.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.NO_LABELS,
        ],
        'death': [
            new Howl({src: 'assets/moonjam3defeat.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.NO_LABELS,
        ],
        0: [
            new Howl({src: 'assets/transition1.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.TRANSITION_1_LABELS,
            new Howl({src: 'assets/transition1-bass.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
        ],
        1: [
            new Howl({src: 'assets/mainsong1-125bpm.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.MAIN_SONG_1_LABELS,
            new Howl({src: 'assets/mainsong1-125bpm-bass.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
        ],
        2: [
            new Howl({src: 'assets/mainsong2-135bpm.mp3', volume: MusicConstants.VOLUME * MusicConstants.BASE}),
            MusicConstants.NO_LABELS,
        ],
    };
    // static ROOMS = [
    //     [
    //         new Howl({src: 'assets/transition1.mp3', volume: MusicConstants.VOLUME}),
    //         MusicConstants.TRANSITION_1_LABELS,
    //     ], [
    //         new Howl({src: 'assets/mainsong1.mp3', volume: MusicConstants.VOLUME}),
    //         MusicConstants.MAIN_SONG_1_LABELS,
    //     ],
    // ];
}