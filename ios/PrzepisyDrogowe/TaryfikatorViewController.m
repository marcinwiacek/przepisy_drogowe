//
//  TaryfikatorViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "TaryfikatorViewController.h"
#import "AppDelegate.h"

@interface TaryfikatorViewController ()

@end

@implementation TaryfikatorViewController


@synthesize taryfikatorWebView = _taryfikatorWebView;
@synthesize taryfikatorNavigationBar = _taryfikatorNavigationBar;
@synthesize taryfikatorSearchBar = taryfikatorSearchBar;
@synthesize nr_akt = nr_akt;
@synthesize nr_rozdzial = nr_rozdzial;
@synthesize taryfikatorLabel = taryfikatorLabel;
@synthesize taryfikatorLeftButton = taryfikatorLeftButton;
@synthesize taryfikatorRightButton = taryfikatorRightButton;
@synthesize taryfikatorChangeButton = taryfikatorChangeButton;


-(IBAction)taryfikatorLeftButtonMenuClicked:(id)sender {
    if (searchcurr>1) {
        searchcurr--;
    }
    
    [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==1) {
        taryfikatorLeftButton.enabled = FALSE;
    }
    taryfikatorRightButton.enabled =  TRUE;
}

-(IBAction)taryfikatorRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==searchall) {
        taryfikatorRightButton.enabled = FALSE;
    }
    if (searchall!=1) {
        taryfikatorLeftButton.enabled = TRUE;
    }
}

-(NSString *)readOldTaryfikator:(NSString *)fname :(NSString *)toSearch2 {
    NSString *mystr = @"";
    
    
    NSData *htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/kary/%@.jso", [[NSBundle mainBundle] bundlePath],fname]];
    
    id jsonObjects = [NSJSONSerialization JSONObjectWithData:htmlData options:NSJSONReadingMutableContainers error:nil];
    
    if ([toSearch2 length]==0) {
        
        Boolean silver=false;
        
        for (NSDictionary *key in [jsonObjects objectForKey:@"m"]) {
            if (silver) {
                mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=silver>%@<br><b>%@; %@</b></td></tr>", mystr, [key objectForKey:@"o"],[key objectForKey:@"w"],[key objectForKey:@"s"]];
            } else {
                mystr = [NSString stringWithFormat:@"%@<tr><td>%@<br><b>%@; %@</b></td></tr>", mystr, [key objectForKey:@"o"],[key objectForKey:@"w"],[key objectForKey:@"s"]];
            }
            silver=!silver;
        }
        
    } else {
        NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:toSearch2]
                                                                                   stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"]
                                                                                  stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"]
                                                                                 stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
        
        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL];
        
        Boolean silver=false;
        long j;
        NSString *temp;
        
        for (NSDictionary *key in [jsonObjects objectForKey:@"m"]) {
            temp = [NSString stringWithFormat:@"%@<br><b>%@; %@", [key objectForKey:@"o"],[key objectForKey:@"w"],[key objectForKey:@"s"]];
            j = [temp length];
            
            temp = [NSString stringWithFormat:@"%@", [regex stringByReplacingMatchesInString:temp options:0 range:NSMakeRange(0, [temp length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"]];
            
            if (j == [temp length]) {
                continue;
            }
            
            if ((([temp length] - j)%43)==0) {
                searchall += ([temp length] - j)/43;
            }
            
            if (silver) {
                mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor=silver>%@</b></td></tr>", mystr, temp];
            } else {
                mystr = [NSString stringWithFormat:@"%@<tr><td>%@</b></td></tr>", mystr, temp];
            }
            
            silver=!silver;
        }
        
    }
    
    return [[[[[[[[[[[[[mystr stringByReplacingOccurrencesOfString:@"c.p.g." withString:@"USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach"]  stringByReplacingOccurrencesOfString:@"k.k." withString:@"USTAWY z dnia 6 czerwca 1997 Kodeks Karny"]stringByReplacingOccurrencesOfString:@"k.w." withString:@"USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń"]stringByReplacingOccurrencesOfString:@"o.o.z.r." withString:@"ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach"]stringByReplacingOccurrencesOfString:@"p.r.d." withString:@"USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")"]
                  stringByReplacingOccurrencesOfString:@"u.k.p." withString:@"USTAWY z dnia 5 stycznia 2011 r. o kierujących pojazdami (dostępna w zakładce \"Treść\")"]
                 stringByReplacingOccurrencesOfString:@"u.d.p." withString:@"USTAWY z dnia 21 marca 1985 r. o drogach publicznych"]stringByReplacingOccurrencesOfString:@"z.s.d." withString:@"ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych"] stringByReplacingOccurrencesOfString:@"u.t.d." withString:@"USTAWY z dnia 6 września 2001 r. o transporcie drogowym"]stringByReplacingOccurrencesOfString:@"h.p.s." withString:@"Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85"] stringByReplacingOccurrencesOfString:@"aetr" withString:@"Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r."] stringByReplacingOccurrencesOfString:@"r.u.j." withString:@"Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym"] stringByReplacingOccurrencesOfString:@"u.s.t.c" withString:@"USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych"];
}

- (void)display {
    if (old_akt == nr_akt) {
        if (nr_rozdzial!=-1) {
            [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial)] completionHandler:nil];
        }
        return;
    }
    old_akt = nr_akt;
    
    NSString *t = taryfikatorSearchBar.text;
    [self.tabBarItem setTitle:@"Taryfikator"];
    
    taryfikatorLeftButton.enabled = FALSE;
    taryfikatorRightButton.enabled = FALSE;
    taryfikatorChangeButton.enabled = FALSE;
    
    taryfikatorLabel.alpha=0.2;
    [spinner startAnimating];
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    
    dispatch_queue_t Queue = dispatch_queue_create("taryfikatorqueue", NULL);
    dispatch_async(Queue, ^{
        @autoreleasepool {
            NSString *mystr = [NSString stringWithFormat:@"<html><head><style>html {-webkit-text-size-adjust: none; } body {width:%@px}</style><meta name = \"viewport\" content = \"minimum-scale=0.1, initial-scale = 1.0, maximum-scale=8.0, shrink-to-fit=YES\"><script type=\"text/javascript\">function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script></head><body><table width=100%%>",[self getWidth:false]];
            
            const char *utfString ;
            self->searchcurr=0;
            self->searchall=0;
            
            
            if (self->nr_akt==0) {
                
                mystr = [NSString stringWithFormat:@"%@%@",mystr,[appDelegate readNewTaryfikator2:t:FALSE]];
                
                self->searchall =appDelegate.mojTaryfikatorSearchNum;
        
            
            } else if (self->nr_akt==6) {
                
                
                NSString *mystr2 = [self readOldTaryfikator:@"20110524":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 24.05.2011 do 10.04.2015</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20101231":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 31.12.2010 do 08.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
                
            } else if (self->nr_akt==5) {
                NSString *mystr2 = [self readOldTaryfikator:@"20110524":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 24.05.2011 do 10.04.2015</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20120609":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 09.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
                
            } else if (self->nr_akt==4) {
                NSString *mystr2 = [self readOldTaryfikator:@"20150411":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 11.04.2015 do 09.08.2017</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20120609":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 09.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
            } else if (self->nr_akt==3) {
                NSString *mystr2 = [self readOldTaryfikator:@"20170810":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 10.08.2017 do 31.12.2021</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20120609":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 09.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
            } else if (self->nr_akt==2) {
                NSString *mystr2 = [self readOldTaryfikator:@"20220101":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 1.1.2022</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20120609":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 09.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
            } else if (self->nr_akt==1) {
            NSString *mystr2 = [self readOldTaryfikator:@"20220101":t];
            if ([mystr2 length]!=0) {
                mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 1.1.2022</b></td></tr>%@",mystr,
                         mystr2];
            }
            
            mystr2 = [self readOldTaryfikator:@"20220917":t];
            if ([mystr2 length]!=0) {
                mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 17.09.2022</b></td></tr>%@",mystr,
                         mystr2];
            }
        }
            
            
            mystr = [NSString stringWithFormat:@"%@</table></body></html>",mystr];
            
            utfString = [mystr UTF8String];
            
            NSData *htmlData2 = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (self->searchall!=0) {
                    self->taryfikatorRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Taryfikator (%li)",self->searchall]];
                }
                self->taryfikatorChangeButton.enabled=TRUE;
                
                self->_taryfikatorWebView.alpha=1;
                
                [self->_taryfikatorWebView loadData:htmlData2 MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
            });
        };
    });
}

- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)taryfikatorSearchBar {
    if ([spinner isAnimating]) return NO;
    return YES;
}

- (void)searchBarSearchButtonClicked:(UISearchBar *)taryfikatorSearchBar {
    [self.taryfikatorSearchBar endEditing:YES];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar *)taryfikatorSearchBar
{
    old_akt = -1;
    nr_rozdzial = -1;
    [self display];
    return YES;
}


- (void)webView:(WKWebView *)taryfikatorWebView
decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
{
    if (navigationAction.navigationType == WKNavigationTypeLinkActivated) {
        if ([spinner isAnimating]) {
            decisionHandler ( WKNavigationActionPolicyCancel);
            return;
            
        }
        
        [_taryfikatorWebView stopLoading];
        
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        
        if ([appDelegate.historiaURLOpisyZnakow count]!=0) {
            [appDelegate.historiaURLOpisyZnakow removeAllObjects];
        }
        if ([appDelegate.historiaTopOpisyZnakow count]!=0) {
            [appDelegate.historiaTopOpisyZnakow removeAllObjects];
        }
        
        [appDelegate.historiaURLOpisyZnakow addObject:[[[navigationAction.request URL]  relativePath] substringFromIndex:NSMaxRange([[[navigationAction.request URL]  relativePath] rangeOfString:@".app/assets/"])] ];
        
        appDelegate.opisyznakowSearch = @"";
        appDelegate.znakimanypages = NO;
        
        [self performSegueWithIdentifier:@"PokazZnak2Segue" sender:self];
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

- (void)webView:(WKWebView *)taryfikatorWebView didFinishNavigation:(WKNavigation *)navigation;
{
    [spinner stopAnimating];
    taryfikatorLabel.alpha=1;
    if (nr_rozdzial!=-1) {
        [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial)] completionHandler:nil];
    }
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
    
    //   [self.taryfikatorRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
    //   [self.taryfikatorRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    
    //   [self.taryfikatorLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
    //   [self.taryfikatorLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    
    self.taryfikatorNavigationBar.barTintColor = [UIColor whiteColor];
    self.taryfikatorSearchBar.barTintColor = [UIColor whiteColor];
    
    // [self.navigationController.navigationBar setBarStyle:UIBarStyleBlack];
    // [self prefersStatusBarHidden];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    taryfikatorLabel = [[UILabel alloc] initWithFrame:frame];
    taryfikatorLabel.backgroundColor = [UIColor clearColor];
    taryfikatorLabel.font = [UIFont boldSystemFontOfSize:14.0];
    taryfikatorLabel.numberOfLines = 2;
    taryfikatorLabel.textAlignment = NSTextAlignmentCenter;
    taryfikatorLabel.textColor = [UIColor blackColor];
    taryfikatorLabel.text = @"Mandaty i punkty razem (opracowanie własne)";
    
    self.taryfikatorNavigationBar.topItem.titleView = taryfikatorLabel;
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    appDelegate.controllertaryfikator=self;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    
    spinner.hidesWhenStopped = YES;
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [self.view addSubview:spinner];
    
    _taryfikatorWebView.navigationDelegate = self;
    
    nr_akt = 0;
    nr_rozdzial = -1;
    old_akt = -1;
    [self display];
}

-(NSString *)getWidth:(bool)or {
    UIDeviceOrientation orientation=[[UIDevice currentDevice]orientation];
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        /*if (or) {
            return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.height*0.97) ];
            
        }*/
        return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*0.97) ];
    }
    
    float notchFix = 0;
    if (UIApplication.sharedApplication.windows.firstObject.safeAreaInsets.bottom>0 &&
        (orientation == UIInterfaceOrientationLandscapeLeft ||
         orientation == UIInterfaceOrientationLandscapeRight)) {
        notchFix = 0.09;
    }
    
    return [NSString stringWithFormat:@"%i",(int)(self.view.bounds.size.width*(0.95-notchFix)) ];
}

-(void)OrientationDidChange:(NSNotification*)notification
{
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [_taryfikatorWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
    
}


@end
