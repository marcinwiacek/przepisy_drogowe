//
//  AppDelegate.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "AppDelegate.h"


@implementation AppDelegate

@synthesize historiaURLOpisyZnakow = historiaURLOpisyZnakow;
@synthesize historiaTopOpisyZnakow = historiaTopOpisyZnakow;
@synthesize controllerznaki = _controllerznaki;
@synthesize controllertaryfikator = _controllertaryfikator;
@synthesize controllertresc = _controllertresc;
@synthesize controllerinne = _controllerinne;
@synthesize opisyznakowSearch = opisyznakowSearch;
@synthesize mojTaryfikatorRozdzial = mojTaryfikatorRozdzial;
@synthesize mojTaryfikatorSearchNum = mojTaryfikatorSearchNum;
@synthesize jsonObjects = jsonObjects;
@synthesize znakimanypages = znakimanypages;
@synthesize level0OpisyZnakow = level0OpisyZnakow;


-(NSString *)readNewTaryfikator2 :(NSString *)toSearch2 :(Boolean)InsideZnakiInne {
    NSString *mystr = @"";
    
    if (!InsideZnakiInne) {
        [mojTaryfikatorRozdzial removeAllObjects];
    }
    
    mojTaryfikatorSearchNum = 0;
    
    if ([toSearch2 length]==0) {
        NSString *keystr;
        Boolean silver=true;
        int i =0;
        for (NSDictionary *key in [jsonObjects objectForKey:@"m"]) {
            mystr = [NSString stringWithFormat:@"%@<tr><td id=bok%lu bgcolor=grey><b>%@</b></td></tr>", mystr, (unsigned long)[mojTaryfikatorRozdzial count], [key objectForKey:@"o"]];
            if (!InsideZnakiInne) {
                [mojTaryfikatorRozdzial addObject:[key objectForKey:@"o"]];
            }
            silver=false;
            for (NSDictionary *key2 in [key objectForKey:@"m"]) {
               
                if (silver) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=silver>%@", mystr, [key2 objectForKey:@"o"]];
                } else {
                    mystr = [NSString stringWithFormat:@"%@<tr><td>%@", mystr, [key2 objectForKey:@"o"]];
                }
                keystr=@"";
                for (NSDictionary *key3 in [key2 objectForKey:@"h"]) {
                    if ([keystr length]!=0) {
                        if (![keystr isEqualToString:[key3 objectForKey:@"m"]]) {
                            break;
                        }
                    }
                    mystr = [NSString stringWithFormat:@"%@<br><a href=q%i><b>%@</b></a>", mystr, i,[key3 objectForKey:@"t"]];
                    keystr=[key3 objectForKey:@"m"];
                }
                
                mystr = [NSString stringWithFormat:@"%@</td></tr>", mystr];
                
                i++;
                silver=!silver;
            }
        }
    } else {
        //Taryfikator znaczy sie
        if (!InsideZnakiInne) {

            NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[NSRegularExpression escapedPatternForString:toSearch2] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"] stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
            
            NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL];
            
            NSString *sekcja=@"";
            NSString *keystr,*temp;
            Boolean silver=true;
            int i = 0;
            for (NSDictionary *key in [jsonObjects objectForKey:@"m"]) {
                sekcja = [key objectForKey:@"o"];
                
                for (NSDictionary *key2 in [key objectForKey:@"m"]) {
                    temp =  [key2 objectForKey:@"o"];
                    
                    keystr=@"";
                    for (NSDictionary *key3 in [key2 objectForKey:@"h"]) {
                        if ([keystr length]!=0) {
                            if (![keystr isEqualToString:[key3 objectForKey:@"m"]]) {
                                break;
                            }
                        }
                        temp = [NSString stringWithFormat:@"%@<br><a href=q%i><b>%@</b></a>", temp, i,[key3 objectForKey:@"t"]];
                        keystr=[key3 objectForKey:@"m"];
                    }
                    
                    keystr = [NSString stringWithFormat:@"%@", [regex stringByReplacingMatchesInString:temp options:0 range:NSMakeRange(0, [temp length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"]];
                    
                    if ([temp length] == [keystr length]) {
                        i++;
                        continue;
                    }
                    
                    if ([sekcja length]!=0) {
                        mystr = [NSString stringWithFormat:@"%@<tr><td id=bok%i bgcolor=grey><b>%@</b></td></tr>", mystr, (int)[mojTaryfikatorRozdzial count],sekcja];
                       
                        [mojTaryfikatorRozdzial addObject:sekcja];

                        sekcja=@"";
                        silver=false;
                    }
                    
                    if ((([keystr length] - [temp length])%43)==0) {
                        mojTaryfikatorSearchNum += ([keystr length] -[temp length])/43;
                    }
                    

                    if (silver) {
                        mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=silver>%@</td></tr>", mystr, keystr];
                    } else {
                        mystr = [NSString stringWithFormat:@"%@<tr><td>%@</td></tr>", mystr, keystr];
                    }
                    
                    
                    i++;
                    silver=!silver;
                }
            }
        } else {

            NSString *reg = [NSString  stringWithFormat:@"(?i:\\Q%@\\E)",toSearch2];
            
          
            
            NSString *sekcja=@"";
            NSString *keystr,*temp;
            Boolean silver=true;
            int i = 0;
            for (NSDictionary *key in [jsonObjects objectForKey:@"m"]) {
                sekcja = [key objectForKey:@"o"];
                
                for (NSDictionary *key2 in [key objectForKey:@"m"]) {
                    if ([[key2 objectForKey:@"o"] rangeOfString:reg options:NSRegularExpressionSearch].location == NSNotFound) {
                        
                        i++;
                        continue;
                    }
                    
                    temp =  [key2 objectForKey:@"o"];
                    
                    keystr=@"";
                    for (NSDictionary *key3 in [key2 objectForKey:@"h"]) {
                        if ([keystr length]!=0) {
                            if (![keystr isEqualToString:[key3 objectForKey:@"m"]]) {
                                break;
                            }
                        }
                        temp = [NSString stringWithFormat:@"%@<br><a href=q%i><b>%@</b></a>", temp, i,[key3 objectForKey:@"t"]];
                        keystr=[key3 objectForKey:@"m"];
                    }

                    
                    if ([sekcja length]!=0) {
                        mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=grey><b>%@</b></td></tr>", mystr,sekcja];
                        
                        
                        sekcja=@"";
                        silver=false;
                    }

                    
                    
                    if (silver) {
                        mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=silver>%@</td></tr>", mystr, temp];
                    } else {
                        mystr = [NSString stringWithFormat:@"%@<tr><td>%@</td></tr>", mystr, temp];
                    }
                    
                    
                    i++;
                    silver=!silver;
                }
            }
            
            
        }
    }
    return mystr;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    opisyznakowSearch = @"";
    historiaURLOpisyZnakow = [[NSMutableArray alloc] init];
    historiaTopOpisyZnakow = [[NSMutableArray alloc] init];
    level0OpisyZnakow = [[NSMutableArray alloc] init];
    
    mojTaryfikatorRozdzial = [[NSMutableArray alloc] init];
    mojTaryfikatorSearchNum = 0;
    
    jsonObjects = [NSJSONSerialization JSONObjectWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/kary/y.jso", [[NSBundle mainBundle] bundlePath]]] options:NSJSONReadingMutableContainers error:nil];
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSDictionary *appDefaults = [NSDictionary dictionaryWithObject:[NSArray arrayWithObjects:@"YES",@"NO",nil] forKey:[NSArray arrayWithObjects:@"szczegoly",@"znakiz2003",nil]];
    [defaults registerDefaults:appDefaults];
    [defaults synchronize];
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        [[UINavigationBar appearance] setBarTintColor:[UIColor whiteColor]];
    }
    // [self.tabBarController.tabBar setTransluflent:NO];
    //self.window.tintColor = [UIColor whiteColor];
    //self.window.backgroundColor = [UIColor whiteColor];
    
    // Override point for customization after application launch.
    return YES;
}
							
- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    if (self.controllerznaki!=NULL) {
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        if (self.controllerznaki.Szczegoly!=[defaults boolForKey:@"szczegoly"] || self.controllerznaki.ZnakiZ2003!=[defaults boolForKey:@"znakiz2003"]) {
            self.controllerznaki.Szczegoly=[defaults boolForKey:@"szczegoly"];
            self.controllerznaki.ZnakiZ2003=[defaults boolForKey:@"znakiz2003"];
            [self.controllerznaki display];
        }
        
    }
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
