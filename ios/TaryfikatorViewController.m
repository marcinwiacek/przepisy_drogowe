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
    
    [_taryfikatorWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];
    
    if (searchcurr==1) {
        taryfikatorLeftButton.enabled = FALSE;
    }
    taryfikatorRightButton.enabled =  TRUE;
}

-(IBAction)taryfikatorRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_taryfikatorWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];
    
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
        NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:toSearch2] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"]
stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"]stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
        
        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:reg options:NSRegularExpressionSearch error:NULL];

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
    
    return [[[[[[[[[[[[mystr stringByReplacingOccurrencesOfString:@"c.p.g." withString:@"USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach"]                                                                                                                                                                        stringByReplacingOccurrencesOfString:@"k.k." withString:@"USTAWY z dnia 6 czerwca 1997 Kodeks Karny"]stringByReplacingOccurrencesOfString:@"k.w." withString:@"USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń"]stringByReplacingOccurrencesOfString:@"o.o.z.r." withString:@"ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach"]stringByReplacingOccurrencesOfString:@"p.r.d." withString:@"USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")"] stringByReplacingOccurrencesOfString:@"u.d.p." withString:@"USTAWY z dnia 21 marca 1985 r. o drogach publicznych"]stringByReplacingOccurrencesOfString:@"z.s.d." withString:@"ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych"] stringByReplacingOccurrencesOfString:@"u.t.d." withString:@"USTAWY z dnia 6 września 2001 r. o transporcie drogowym"]stringByReplacingOccurrencesOfString:@"h.p.s." withString:@"Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85"] stringByReplacingOccurrencesOfString:@"aetr" withString:@"Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r."] stringByReplacingOccurrencesOfString:@"r.u.j." withString:@"Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym"] stringByReplacingOccurrencesOfString:@"u.s.t.c" withString:@"USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych"];
}

- (void)display {
    if (old_akt == nr_akt) {
        if (nr_rozdzial!=-1) {
            [_taryfikatorWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial)]];
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
    
    dispatch_queue_t Queue = dispatch_queue_create("taryfikatorqueue", NULL);
    dispatch_async(Queue, ^{
        @autoreleasepool {
            NSString *mystr = @"<html><head><style>html {-webkit-text-size-adjust: none; }</style><meta name = \"viewport\" content = \"initial-scale = 0.1, user-scalable = yes\"><script type=\"text/javascript\">function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script></head><body><table width=100%>";
            const char *utfString ;
            searchcurr=0;
            searchall=0;
            
            
            if (nr_akt==0) {
                AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
                
                mystr = [NSString stringWithFormat:@"%@%@",mystr,[appDelegate readNewTaryfikator2:t:FALSE]];
                
                searchall =appDelegate.mojTaryfikatorSearchNum;
            } else if (nr_akt==3) {
              
                
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

            } else if (nr_akt==2) {
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
            
            } else if (nr_akt==1) {
                NSString *mystr2 = [self readOldTaryfikator:@"20150411":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Mandaty od 11.04.2015</b></td></tr>%@",mystr,
                             mystr2];
                }
                
                mystr2 = [self readOldTaryfikator:@"20120609":t];
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<tr><td bgcolor = grey><b>Punkty od 09.06.2012</b></td></tr>%@",mystr,
                             mystr2];
                }
                
            }
            mystr = [NSString stringWithFormat:@"%@</table></body></html>",mystr];
            
            utfString = [mystr UTF8String];
            
            NSData *htmlData2 = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (searchall!=0) {
                    taryfikatorRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Taryfikator (%li)",searchall]];
                }
                taryfikatorChangeButton.enabled=TRUE;
                
                _taryfikatorWebView.alpha=1;
                
                [_taryfikatorWebView loadData:htmlData2 MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
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

- (BOOL)webView:(UIWebView*)taryfikatorWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType {
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        if ([spinner isAnimating]) return YES;
        
        [_taryfikatorWebView stopLoading];
        
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        
        if ([appDelegate.historiaURLOpisyZnakow count]!=0) {
            [appDelegate.historiaURLOpisyZnakow removeAllObjects];
        }
        if ([appDelegate.historiaTopOpisyZnakow count]!=0) {
            [appDelegate.historiaTopOpisyZnakow removeAllObjects];
        }
        
        [appDelegate.historiaURLOpisyZnakow addObject:[[[request URL]  relativePath] substringFromIndex:NSMaxRange([[[request URL]  relativePath] rangeOfString:@".app/assets/"])] ];
        
        appDelegate.opisyznakowSearch = @"";
        appDelegate.znakimanypages = NO;
        
        [self performSegueWithIdentifier:@"PokazZnak2Segue" sender:self];
        
        return YES;
    }
    return YES;
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

-(void)webViewDidFinishLoad:(UIWebView *)inneWebView{
    [spinner stopAnimating];
    taryfikatorLabel.alpha=1;
    if (nr_rozdzial!=-1) {
        [_taryfikatorWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial)]];
    }
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        [self.taryfikatorRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
        [self.taryfikatorRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        [self.taryfikatorLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
        [self.taryfikatorLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        self.taryfikatorNavigationBar.barTintColor = [UIColor whiteColor];
        self.taryfikatorSearchBar.barTintColor = [UIColor whiteColor];
        self.edgesForExtendedLayout=UIRectEdgeNone;
        [self prefersStatusBarHidden];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    taryfikatorLabel = [[UILabel alloc] initWithFrame:frame];
    taryfikatorLabel.backgroundColor = [UIColor clearColor];
    taryfikatorLabel.font = [UIFont boldSystemFontOfSize:14.0];
    taryfikatorLabel.numberOfLines = 2;
    taryfikatorLabel.textAlignment = NSTextAlignmentCenter;
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        taryfikatorLabel.textColor = [UIColor blackColor];
    } else {
        taryfikatorLabel.textColor = [UIColor whiteColor];
    }
    taryfikatorLabel.text = @"Mandaty i punkty razem (opracowanie własne)";
    
    self.taryfikatorNavigationBar.topItem.titleView = taryfikatorLabel;
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    appDelegate.controllertaryfikator=self;
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    } else {
         spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    }
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    
    nr_akt = 0;
    nr_rozdzial = -1;
    old_akt = -1;
    [self display];
}

- (void)viewDidAppear:(BOOL)animated
{
    UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
    if(orientation == UIInterfaceOrientationPortrait ||
       orientation == UIInterfaceOrientationPortraitUpsideDown) {
        spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    } else  {
        spinner.center = CGPointMake(CGRectGetHeight([[UIScreen mainScreen] bounds])/2, 22);
    }
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation duration:(NSTimeInterval)duration
{
    
    if(interfaceOrientation == UIInterfaceOrientationPortrait ||
       interfaceOrientation == UIInterfaceOrientationPortraitUpsideDown) {
        spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    } else  {
        spinner.center = CGPointMake(CGRectGetHeight([[UIScreen mainScreen] bounds])/2, 22);
    }
}


@end
