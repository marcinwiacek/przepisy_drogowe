//
//  ZnakiViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/3/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "ZnakiViewController.h"
#import "ZnakiChangeViewController.h"
#import "AppDelegate.h"

@interface ZnakiViewController ()

@end

@implementation ZnakiViewController

@synthesize znakiWebView = _znakiWebView;
@synthesize znakiSearchBar = znakiSearchBar;
@synthesize nr = nr;
@synthesize znakiLabel = znakiLabel;
@synthesize znakiNavigationBar = _znakiNavigationBar;
@synthesize ZnakiZ2003 = ZnakiZ2003;
@synthesize Szczegoly = Szczegoly;
@synthesize znakiChangeButton = znakiChangeButton;

- (void)display
{
    znakiLabel.alpha=0.2;
    [spinner startAnimating];
    NSString *t = znakiSearchBar.text;
    
    znakiChangeButton.enabled=FALSE;
    
    [self.tabBarItem setTitle:@"Znaki"];
    
    dispatch_queue_t Queue = dispatch_queue_create("znakiqueue", NULL);
    dispatch_async(Queue, ^{
        @autoreleasepool {
            NSString *mystr;
            
            AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
            [appDelegate.level0OpisyZnakow removeAllObjects];
            
            NSArray *array;
            if ([[NSUserDefaults standardUserDefaults] boolForKey:@"znakiz2003"]) {
                array = @[
                    
                    @[@"a/a01", @"a/a02", @"a/a03", @"a/a04", @"a/a05", @"a/a06a", @"a/a06b", @"a/a06c", @"a/a06d", @"a/a06e", @"a/a07", @"a/a08", @"a/a09",@"a/a10",@"a/a11",
                      @"a/a11a",@"a/a12a",@"a/a12b",@"a/a12c",@"a/a13",@"a/a14",
                      @"a/a15",@"a/a16",@"a/a17",@"a/a18a",@"a/a18b",@"a/a19",@"a/a20",
                      @"a/a21",@"a/a22",@"a/a23",@"a/a24",@"a/a25",@"a/a26",@"a/a27",
                      @"a/a28",@"a/a29",@"a/a30",@"a/a31",@"a/a31odwrocony",
                      @"a/a32",@"a/a33",@"a/a34"],
                    @[@"b/b01", @"b/b01_godziny", @"b/b02", @"b/b03", @"b/b03_04",@"b/b03_04_10", @"b/b03a", @"b/b04", @"b/b05", @"b/b05_6ton", @"b/b06",@"b/b06_08",
                      @"b/b06_08_09",@"b/b07", @"b/b07_5ton", @"b/b08",@"b/b09",@"b/b09_12",
                      @"b/b10",@"b/b11",@"b/b12",@"b/b13",@"b/b13_14",@"b/b13a",@"b/b14",
                      @"b/b15",@"b/b16",@"b/b17",@"b/b18",@"b/b19",@"b/b20",@"b/b21",
                      @"b/b22",@"b/b23",@"b/b24",@"b/b25",@"b/b26",@"b/b27",@"b/b28",
                      @"b/b29",@"b/b30",@"b/b31",@"b/b32",@"b/b32a",@"b/b32b",@"b/b32c",
                      @"b/b32d",@"b/b32e",@"b/b32f",@"b/b33",@"b/b34",@"b/b35",
                      @"b/b35_ponad",@"b/b35_w_godz",@"b/b35_all",@"b/b36",@"b/b37",
                      @"b/b38",@"b/b39",@"b/b40",@"b/b41",@"b/b42",@"b/b43",@"b/b44"],
                    @[@"c/c01", @"c/c02", @"c/c03", @"c/c04", @"c/c05", @"c/c06", @"c/c07", @"c/c08", @"c/c09",@"c/c10",@"c/c11",@"c/c12",@"c/c13",@"c/c13_16_1",
                      @"c/c13_16_2",@"c/c13_16_3",@"c/c13a",@"c/c14",@"c/c15",@"c/c16",
                      @"c/c16a",@"c/c17",@"c/c18",@"c/c19"],
                    @[@"d/d01", @"d/d02", @"d/d03", @"d/d04a", @"d/d04b", @"d/d04b_2", @"d/d05",
                      @"d/d06", @"d/d06a", @"d/d06b", @"d/d07", @"d/d08", @"d/d09", @"d/d10",
                      @"d/d11",@"d/d12",@"d/d13",@"d/d13a",@"d/d13b",@"d/d14",@"d/d14a",
                      @"d/d14a_2",@"d/d14b",@"d/d15",@"d/d16",@"d/d17",@"d/d18",@"d/d18a",
                      @"d/d18b",@"d/d19",@"d/d19a",@"d/d20",@"d/d20a",@"d/d21",@"d/d21a",
                      @"d/d22",@"d/d23",@"d/d23a",@"d/d24",@"d/d25",
                      @"d/d25_2",@"d/d26",
                      @"d/d26a",@"d/d26b",@"d/d26c",@"d/d26c_2",@"d/d26d",@"d/d27",@"d/d28",
                      @"d/d29",@"d/d30",@"d/d31",@"d/d32",@"d/d33",@"d/d34",@"d/d34a",@"d/d34b",	@"d/d34b_2",
                      @"d/d35",@"d/d35a",@"d/d36",@"d/d36a",@"d/d37",@"d/d38",@"d/d39",
                      @"d/d39a",@"d/d40",@"d/d41",@"d/d42",@"d/d43",@"d/d44",@"d/d45",
                      @"d/d46",@"d/d47",@"d/d48",@"d/d48_2",@"d/d49",@"d/d50",@"d/d51",
                      @"d/d51a", @"d/d51b",@"d/d52",@"d/d53",@"d/d54",@"d/d55"],
                    @[@"e/e01", @"e/e01_2",@"e/e01_3",@"e/e01_4",@"e/e01_5",@"e/e01_6",@"e/e01_7",
                      @"e/e01a",@"e/e01a_2", @"e/e01b", @"e/e01b_2",@"e/e02a",@"e/e02a_1",
                      @"e/e02a_2",@"e/e02a_3",@"e/e02a_4",@"e/e02a_5",@"e/e02a_6",
                      @"e/e02b", @"e/e02c", @"e/e02d", @"e/e02e", @"e/e02f", @"e/e03",
                      @"e/e03_2", @"e/e04",@"e/e04_2", @"e/e05", @"e/e05a", @"e/e06",
                      @"e/e06a",@"e/e06a_2",@"e/e06b",@"e/e06c",@"e/e06_wz1",@"e/e06_wz2",
                      @"e/e06_wz3",@"e/e06_wz4",@"e/e07",@"e/e07_2",@"e/e08",
                      @"e/e08_2",@"e/e09",@"e/e10",@"e/e10_2",@"e/e10_3",@"e/e11",
                      @"e/e11_2",@"e/e11_3",@"e/e11_4",@"e/e12",@"e/e12a",@"e/e12a_2",
                      @"e/e_d18",@"e/e_d30",@"e/e_przem",@"e/e13",@"e/e14",@"e/e14_2",
                      @"e/e14a",@"e/e15a",@"e/e15b",@"e/e15c",@"e/e15d",
                      @"e/e16",@"e/e17a",@"e/e18a",
                      @"e/e19a",@"e/e20",@"e/e20_2",@"e/e21",@"e/e22a",@"e/e22b",
                      @"e/e22b_2",@"e/e22c"],
                    @[@"f/f01", @"f/f02", @"f/f02a", @"f/f03", @"f/f04", @"f/f05", @"f/f06",
                      @"f/f07",@"f/f07_2",@"f/f07_3",@"f/f07_4",@"f/f07_5",@"f/f07_6",
                      @"f/f07_7",@"f/f07_8", @"f/f08",@"f/f09",@"f/f10",@"f/f11",@"f/f12",
                      @"f/f13",@"f/f14a",@"f/f14b",@"f/f14c",@"f/f14d",@"f/f14e",@"f/f14f",@"f/f15",@"f/f16",
                      @"f/f17",@"f/f18",@"f/f18a",@"f/f18b",@"f/f19",@"f/f20",
                      @"f/f21",@"f/f21_2",@"f/f21_3",@"f/f22",@"f/f22a"],
                    @[@"t/t01",@"t/t01a",@"t/t01b",@"t/t02",@"t/t03",@"t/t03a",@"t/t04",
                      @"t/t05",@"t/t06a",@"t/t06b",@"t/t06c",@"t/t06d",@"t/t07",@"t/t08",
                      @"t/t09",@"t/t10",@"t/t11",@"t/t12",@"t/t13",@"t/t14",@"t/t14a",
                      @"t/t14b",@"t/t14c",@"t/t14d",@"t/t15",@"t/t16",@"t/t16a",
                      @"t/t17",@"t/t18",@"t/t18a",@"t/t18b",@"t/t18c",@"t/t19",
                      @"t/t20",@"t/t21",@"t/t22",@"t/t23a",@"t/t23b",@"t/t23c",
                      @"t/t23d",@"t/t23e",@"t/t23f",@"t/t23g",@"t/t23h",@"t/t23i",
                      @"t/t23j",@"t/t24",@"t/t25a",@"t/t25b",@"t/t25c",@"t/t26",
                      @"t/t27", @"t/t28",@"t/t28a",@"t/t29",@"t/t30",@"t/t30a",
                      @"t/t30b",@"t/t30c",@"t/t30d",@"t/t30e",@"t/t30f",@"t/t30g",
                      @"t/t30h",@"t/t30i",@"t/t31",@"t/t32",@"t/t33",@"t/t34"],
                    @[@"g/g01a", @"g/g01b", @"g/g01c", @"g/g01d", @"g/g01e", @"g/g01f", @"g/g02", @"g/g03", @"g/g04"],
                    @[@"at_bt/at1", @"at_bt/at2",@"at_bt/at3",@"at_bt/at4",@"at_bt/at5",@"at_bt/bt1",@"at_bt/bt2",@"at_bt/bt3",@"at_bt/bt4"],
                    @[@"r/r1",@"r/r1a",@"r/r1b",@"r/r2",@"r/r2a",@"r/r3",@"r/r4",@"r/r4_2",@"r/r4_3",@"r/r4a",@"r/r4b",@"r/r4c",@"r/r4d",@"r/r4e"],
                    @[@"w/w1",@"w/w2",@"w/w3",@"w/w4",@"w/w5",@"w/w6",@"w/w7"],
                    @[@"p/p01",@"p/p01a",@"p/p01b",@"p/p01c",@"p/p01d",@"p/p01e", @"p/p02",
                      @"p/p02a",@"p/p02b",@"p/p03",@"p/p03a",@"p/p03b", @"p/p04", @"p/p05",
                      @"p/p06", @"p/p06a", @"p/p07a", @"p/p07b", @"p/p07c",@"p/p07d",@"p/p08a",
                      @"p/p08b",@"p/p08c",@"p/p08d",@"p/p08e",@"p/p08f",@"p/p08g",@"p/p08h",
                      @"p/p08i",@"p/p09",@"p/p09a",@"p/p09b",@"p/p10",@"p/p11",@"p/p12",
                      @"p/p13",@"p/p14",@"p/p15",@"p/p16",@"p/p17",@"p/p18",@"p/p19",
                      @"p/p20",@"p/p21",@"p/p22",@"p/p23",@"p/p24",@"p/p25",@"p/p26",@"p/p27"],
                    @[@"s/s01", @"s/s02", @"s/s03", @"s/s04", @"s/s05", @"s/s06",@"s/s07"],
                    @[@"sb_st/sb",@"sb_st/st",@"sb_st/stk",@"sb_st/stt1",@"sb_st/stt2"],
                    @[@"inne/e15e",@"inne/e15f",@"inne/e15g",@"inne/e15h",@"inne/suwak"],
                    @[@""],
                    @[@"u/u01a",@"u/u01b",@"u/u01c",@"u/u01d",@"u/u01e",@"u/u01f",@"u/u02",
                      @"u/u03a",@"u/u03b",@"u/u03c",@"u/u03d",@"u/u03e",@"u/u04a",
                      @"u/u04b",@"u/u04c",@"u/u05a",@"u/u05b",@"u/u05c",@"u/u06a",
                      @"u/u06b",@"u/u06c",@"u/u06d",@"u/u07",@"u/u08",@"u/u09a",
                      @"u/u09b",@"u/u09c",@"u/u10a",@"u/u10b",@"u/u11a",@"u/u11b",
                      @"u/u12a",@"u/u12b",@"u/u12c",@"u/u13a",@"u/u13b",@"u/u13c",
                      @"u/u14a",@"u/u14b",@"u/u14c",@"u/u14d",@"u/u14e",@"u/u15a",
                      @"u/u15b",@"u/u16a",@"u/u16b",@"u/u16c",@"u/u16d",@"u/u17",
                      @"u/u18a",@"u/u18b",@"u/u19",@"u/u20a",@"u/u20b",@"u/u20c",
                      @"u/u20d",@"u/u21a",@"u/u21b",@"u/u21c",@"u/u21d",@"u/u21e",
                      @"u/u21f",@"u/u22",@"u/u23a",@"u/u23b",@"u/u23c",@"u/u23d",
                      @"u/u24",@"u/u25a",@"u/u25b",@"u/u25c",@"u/u26",@"u/u26a",
                      @"u/u26b",@"u/u26c",@"u/u26d",@"u/u27",@"u/u28",@"u/wiatr",
                      @"u/wahadlo",@"u/pogoda",@"u/tablica",@"u/ostrzeg",@"u/speed"]
                    
                    
                ];
                
            } else {
                array = @[
                    @[@"a/a01", @"a/a02", @"a/a03", @"a/a04", @"a/a05", @"a/a06a", @"a/a06b",
                      @"a/a06c", @"a/a06d", @"a/a06e", @"a/a07", @"a/a08", @"a/a09",
                      @"a/a10",@"a/a11",@"a/a11a",@"a/a12a",@"a/a12b",@"a/a12c",
                      @"a/a13",@"a/a14",@"a/a15",@"a/a16",@"a/a17",@"a/a18a",
                      @"a/a18b",@"a/a19",@"a/a20",@"a/a21",@"a/a22",@"a/a23",
                      @"a/a24",@"a/a25",@"a/a26",@"a/a27",@"a/a28",@"a/a29",@"a/a30",
                      @"a/a31",@"a/a32",@"a/a33",@"a/a34"],
                    @[@"b/b01", @"b/b02", @"b/b03", @"b/b03a", @"b/b04", @"b/b05", @"b/b06", @"b/b07",
                      @"b/b08", @"b/b09",@"b/b10",@"b/b11",@"b/b12",@"b/b13",@"b/b13a",
                      @"b/b14",@"b/b15",@"b/b16",@"b/b17",@"b/b18",@"b/b19",@"b/b20",
                      @"b/b21",@"b/b22",@"b/b23",@"b/b24",@"b/b25",@"b/b26",@"b/b27",
                      @"b/b28",@"b/b29",@"b/b30",@"b/b31",@"b/b32",@"b/b33",@"b/b34",
                      @"b/b35",@"b/b36",@"b/b37",@"b/b38",@"b/b39",@"b/b40",@"b/b41",
                      @"b/b42",@"b/b43",@"b/b44"],
                    @[@"c/c01", @"c/c02", @"c/c03", @"c/c04", @"c/c05", @"c/c06", @"c/c07", @"c/c08",
                      @"c/c09",@"c/c10",@"c/c11",@"c/c12",@"c/c13",@"c/c13a",@"c/c14",
                      @"c/c15",@"c/c16",@"c/c16a",@"c/c17",@"c/c18",@"c/c19"],
                    @[@"d/d01", @"d/d02", @"d/d03", @"d/d04a", @"d/d04b", @"d/d05", @"d/d06", @"d/d06a",
                      @"d/d06b", @"d/d07", @"d/d08", @"d/d09", @"d/d10", @"d/d11",@"d/d12",
                      @"d/d13",@"d/d13a",@"d/d14",@"d/d15",@"d/d16",@"d/d17",@"d/d18",
                      @"d/d18a",@"d/d18b",@"d/d19",@"d/d20",@"d/d21",@"d/d21a",@"d/d22",
                      @"d/d23",@"d/d23a",@"d/d24",@"d/d25",@"d/d26",
                      @"d/d26a",@"d/d26b",
                      @"d/d26c",@"d/d26d",@"d/d27",@"d/d28",@"d/d29",@"d/d30",@"d/d31",
                      @"d/d32",@"d/d33",@"d/d34",@"d/d34a",@"d/d35",@"d/d35a",@"d/d36",
                      @"d/d36a",@"d/d37",@"d/d38",@"d/d39",@"d/d39a",@"d/d40",@"d/d41",
                      @"d/d42", @"d/d43",@"d/d44",@"d/d45",@"d/d46",@"d/d47",@"d/d48",
                      @"d/d49",@"d/d50",@"d/d51",@"d/d52",@"d/d53",
                      @"d/d54",@"d/d55"],
                    @[@"e/e01", @"e/e01a", @"e/e01b", @"e/e02a", @"e/e02b", @"e/e02c", @"e/e02d",
                      @"e/e02e", @"e/e02f", @"e/e03", @"e/e04", @"e/e05", @"e/e06",@"e/e06a",
                      @"e/e06b",@"e/e06c",@"e/e07",@"e/e08",@"e/e09",@"e/e10",@"e/e11",
                      @"e/e12",@"e/e12a",@"e/e13",@"e/e14",@"e/e14a",@"e/e15a",@"e/e15b",
                      @"e/e15c",@"e/e15d",@"e/e16",
                      @"e/e17a",@"e/e18a",@"e/e19a",@"e/e20",@"e/e21",@"e/e22a",@"e/e22b",
                      @"e/e22c"],
                    @[@"f/f01", @"f/f02", @"f/f02a", @"f/f03", @"f/f04", @"f/f05", @"f/f06", @"f/f07",
                      @"f/f08",@"f/f09",@"f/f10",@"f/f11",@"f/f12",@"f/f13",@"f/f14a",
                      @"f/f14b",@"f/f14c",@"f/f14d",@"f/f14e",@"f/f14f",@"f/f15",@"f/f16",@"f/f17",@"f/f18",@"f/f19",
                      @"f/f20",@"f/f21",@"f/f22"],
                    @[@"t/t01",@"t/t01a",@"t/t01b",@"t/t02",@"t/t03",@"t/t03a",@"t/t04",@"t/t05",
                      @"t/t06a",@"t/t06b",@"t/t06c",@"t/t06d",@"t/t07",@"t/t08",@"t/t09",
                      @"t/t10",@"t/t11",@"t/t12",@"t/t13",@"t/t14",@"t/t15",@"t/t16",
                      @"t/t17",@"t/t18",@"t/t19",@"t/t20",@"t/t21",@"t/t22",@"t/t23a",
                      @"t/t23b",@"t/t23c",@"t/t23d",@"t/t23e",@"t/t23f",@"t/t23g",
                      @"t/t23h",@"t/t23i",@"t/t23j",@"t/t24",@"t/t25a",@"t/t25b",
                      @"t/t25c",@"t/t26",@"t/t27", @"t/t28",@"t/t29",@"t/t30",@"t/t31",
                      @"t/t32",@"t/t33",@"t/t34"],
                    @[@"g/g01a", @"g/g01b", @"g/g01c", @"g/g01d", @"g/g01e", @"g/g01f", @"g/g02",
                      @"g/g03", @"g/g04"],
                    @[@"at_bt/at1", @"at_bt/at2",@"at_bt/at3",@"at_bt/at4",@"at_bt/at5",@"at_bt/bt1",@"at_bt/bt2",@"at_bt/bt3",@"at_bt/bt4"],
                    @[@"r/r1",@"r/r1a",@"r/r1b",@"r/r2",@"r/r2a",@"r/r3",@"r/r4",@"r/r4a",@"r/r4b",@"r/r4c",@"r/r4d",@"r/r4e"],
                    @[@"w/w1",@"w/w2",@"w/w3",@"w/w4",@"w/w5",@"w/w6",@"w/w7"],
                    @[@"p/p01",@"p/p02", @"p/p03",@"p/p04", @"p/p05", @"p/p06",@"p/p07a", @"p/p07b", @"p/p08a",@"p/p08b",@"p/p08c",@"p/p09",@"p/p10",@"p/p11",@"p/p12",@"p/p13",@"p/p14",@"p/p15",@"p/p16",@"p/p17",@"p/p18",@"p/p19",@"p/p20",@"p/p21",@"p/p22",@"p/p23",@"p/p24",@"p/p25",@"p/p26",@"p/p27"],
                    @[@"s/s01", @"s/s02", @"s/s03", @"s/s04", @"s/s05", @"s/s06",@"s/s07"],
                    @[@"sb_st/sb",@"sb_st/st",@"sb_st/stk",@"sb_st/stt1",@"sb_st/stt2"],
                    @[@"inne/e15e",@"inne/e15f",@"inne/e15g",@"inne/e15h",@"inne/suwak"],
                    @[@""],@[@""]
                ];
            }
            long start=self->nr;
            long end=self->nr;
            
            if (self->nr==15) {
                start=0;
                end=14;
            }
            
            mystr = [NSString stringWithFormat:@"<html><head><style>html {-webkit-text-size-adjust: none;} body {width:%@px}</style><meta name = \"viewport\" content = \"minimum-scale=0.1, initial-scale = ", [self getWidth:false]];
            
            if ([[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"]) {
                mystr = [NSString stringWithFormat:@"%@1.0, maximum-scale=4.0, shrink-to-fit=yes\"></head><body>", mystr];
                
                if ([t length]!=0) { // search
                    NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:t] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"] stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"] stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                    
                    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL];
                    
                    mystr = [NSString stringWithFormat:@"%@<table>", mystr];
                    for(long i=start;i<=end;i++) {
                        
                        for (NSString *element in [array objectAtIndex:i]) {
                            NSString *txt = [[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm",[[NSBundle mainBundle] resourcePath],element]] encoding:NSUTF8StringEncoding];
                            
                            NSRange r = [regex rangeOfFirstMatchInString:txt options:0 range:NSMakeRange(0, [txt length])];
                            
                            if (r.location!=NSNotFound) {
                                NSArray *myWords = [[txt stringByReplacingOccurrencesOfString:@"\r" withString:@""] componentsSeparatedByString:@"\n"];
                                
                                mystr = [NSString stringWithFormat:@"%@%@%@%@%@%@%@%@%@%@%@%@", mystr,@"<tr><td width=40% align=center><a href=",element,@"><img src=",element,@".png style='margin:2px;max-width:100%'></a></td><td><a href=",element,@"><b>",[regex stringByReplacingMatchesInString:[myWords objectAtIndex:1] options:0 range:NSMakeRange(0, [[myWords objectAtIndex:1] length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"],@"</b> ",[regex stringByReplacingMatchesInString:[myWords objectAtIndex:0] options:0 range:NSMakeRange(0, [[myWords objectAtIndex:0] length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"],@"</a></td></tr>"];
                                
                                [appDelegate.level0OpisyZnakow addObject:element];
                            }
                        }
                        
                    }
                    mystr = [NSString stringWithFormat:@"%@</table>", mystr];
                } else {
                    mystr = [NSString stringWithFormat:@"%@<table>", mystr];
                    for(long i=start;i<=end;i++) {
                        for (NSString *element in [array objectAtIndex:i]) {
                            NSString *txt = [[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm",[[NSBundle mainBundle] resourcePath],element]] encoding:NSUTF8StringEncoding];
                            
                            NSArray *myWords = [[txt stringByReplacingOccurrencesOfString:@"\r" withString:@""] componentsSeparatedByString:@"\n"];
                            
                            mystr = [NSString stringWithFormat:@"%@%@%@%@%@%@%@%@%@%@%@%@", mystr,@"<tr><td width=40% align=center><a href=",element,@"><img src=",element,@".png style='margin:2px;max-width:100%'></a></td><td><a href=",element,@"><b>",[myWords objectAtIndex:1],@"</b> ",[myWords objectAtIndex:0],@"</a></td></tr>"];
                            
                            [appDelegate.level0OpisyZnakow addObject:element];
                        }
                        
                    }
                    mystr = [NSString stringWithFormat:@"%@</table>", mystr];
                }
                
            } else { // no details
                
                mystr = [NSString stringWithFormat:@"%@0.4, maximum-scale=8.0, shrink-to-fit=yes\"></head><body>", mystr];
                
                if ([t length]!=0) { // search
                    NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[NSRegularExpression escapedPatternForString:t] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"] stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                    
                    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL];
                    
                    for(long i=start;i<=end;i++) {
                        mystr = [NSString stringWithFormat:@"%@<center>", mystr];
                        
                        for (NSString *element in [array objectAtIndex:i]) {
                            NSString *txt = [[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm",[[NSBundle mainBundle] resourcePath],element]] encoding:NSUTF8StringEncoding];
                            
                            NSRange r = [regex rangeOfFirstMatchInString:txt options:0 range:NSMakeRange(0, [txt length])];
                            
                            if (r.location!=NSNotFound) {
                                mystr = [NSString stringWithFormat:@"%@%@%@%@%@%@", mystr,@"<a href=",element,@"><img src=",element,@".png style='margin:2px;max-width:100%'></a>"];
                                
                                [appDelegate.level0OpisyZnakow addObject:element];
                            }
                        }
                        mystr = [NSString stringWithFormat:@"%@</center>", mystr];
                        
                        
                    }
                } else {
                    for(long i=start;i<=end;i++) {
                        mystr = [NSString stringWithFormat:@"%@<center>", mystr];
                        
                        for (NSString *element in [array objectAtIndex:i]) {
                            mystr = [NSString stringWithFormat:@"%@%@%@%@%@%@", mystr,@"<a href=",element,@"><img src=",element,@".png style='margin:2px;max-width:100%'></a>"];
                            
                            [appDelegate.level0OpisyZnakow addObject:element];
                        }
                        mystr = [NSString stringWithFormat:@"%@</center>", mystr];
                    }
                }
            }
            
            
            mystr = [NSString stringWithFormat:@"%@</body></html>", mystr];
            const char *utfString = [mystr UTF8String];
            NSData *htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([appDelegate.level0OpisyZnakow count]!=0 && [t length]!=0) {
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Znaki [%lu]",(unsigned long)[appDelegate.level0OpisyZnakow count]]];
                }
                
                self->_znakiWebView.alpha=1;
                
                self->znakiChangeButton.enabled = TRUE;
                
                [self->_znakiWebView loadData:htmlData MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
            });
        };
    });
}

- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)znakiSearchBar {
    if ([spinner isAnimating]) return NO;
    return YES;
}


- (void)searchBarSearchButtonClicked:(UISearchBar *)znakiSearchBar {
    [self.znakiSearchBar endEditing:YES];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar *)znakiSearchBar
{
    [self display];
    return YES;
}


- (void)webView:(WKWebView *)znakiWebView
decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
{
    if (navigationAction.navigationType == WKNavigationTypeLinkActivated) {
        if ([spinner isAnimating]) {
            decisionHandler ( WKNavigationActionPolicyCancel);
            return;
            
        }
        
        [_znakiWebView stopLoading];
        
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        
        if ([appDelegate.historiaURLOpisyZnakow count]!=0) {
            [appDelegate.historiaURLOpisyZnakow removeAllObjects];
        }
        if ([appDelegate.historiaTopOpisyZnakow count]!=0) {
            [appDelegate.historiaTopOpisyZnakow removeAllObjects];
        }
        
        [appDelegate.historiaURLOpisyZnakow addObject:[[[navigationAction.request URL]  relativePath] substringFromIndex:NSMaxRange([[[navigationAction.request URL]  relativePath] rangeOfString:@".app/assets/"])] ];
        
        appDelegate.znakimanypages=YES;
        appDelegate.opisyznakowSearch = znakiSearchBar.text;
        
        [self performSegueWithIdentifier:@"PokazZnakSegue" sender:self];
        decisionHandler (WKNavigationActionPolicyCancel);
        return;
    }
    
    decisionHandler (WKNavigationActionPolicyAllow);
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
    
    self.znakiNavigationBar.barTintColor = [UIColor whiteColor];
    self.znakiSearchBar.barTintColor = [UIColor whiteColor];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    znakiLabel = [[UILabel alloc] initWithFrame:frame];
    znakiLabel.backgroundColor = [UIColor clearColor];
    znakiLabel.font = [UIFont boldSystemFontOfSize:14.0];
    znakiLabel.numberOfLines = 2;
    znakiLabel.textAlignment = NSTextAlignmentCenter;
    
    znakiLabel.textColor = [UIColor blackColor];
    
    self.znakiNavigationBar.topItem.titleView = znakiLabel;
    
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        nr = 15;
        znakiLabel.text = @"Wszystkie znaki";
    } else {
        nr = 0;
        znakiLabel.text = @"Znaki ostrzegawcze (A)";
    }
    
    NSDictionary *appDefaults = [NSDictionary dictionaryWithObjectsAndKeys:
                                    @"FALSE", @"szczegoly",
                                    @"TRUE", @"znakiz2003", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:appDefaults];
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.controllerznaki=self;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    
    spinner.hidesWhenStopped = YES;
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [self.view addSubview:spinner];
    
    _znakiWebView.navigationDelegate = self;
    
    [self display];
}

-(NSString *)getWidth:(bool)or {
    UIDeviceOrientation orientation=[[UIDevice currentDevice]orientation];
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        if ([[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"]) {
            return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*0.97) ];
        }
        return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*2.42) ];
    }
    
    float notchFix = 0;
    if (UIApplication.sharedApplication.windows.firstObject.safeAreaInsets.bottom>0 &&
        (orientation == UIInterfaceOrientationLandscapeLeft ||
           orientation == UIInterfaceOrientationLandscapeRight)) {
        notchFix = 0.09;
    }
    
    if ([[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"]) {
        return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*(0.97-notchFix)) ];
    }
    return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*(2.42-notchFix)) ];
    
}

-(void)OrientationDidChange:(NSNotification*)notification
{
   spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [_znakiWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
}

- (void)webView:(WKWebView *)znakiWebView didFinishNavigation:(WKNavigation *)navigation;
{
    [spinner stopAnimating];
    znakiLabel.alpha=1;
}


@end
