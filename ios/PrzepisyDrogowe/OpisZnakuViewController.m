//
//  OpisZnakuViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/5/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "OpisZnakuViewController.h"
#import "AppDelegate.h"

@interface OpisZnakuViewController ()

@end

@implementation OpisZnakuViewController

@synthesize opisZnakuLabel = _opisZnakuLabel;
@synthesize opisZnakuNavigationBar = _opisZnakuNavigationBar;
@synthesize opisZnakuPageControl = opisZnakuPageControl;
@synthesize opisZnakuScrollView = opisZnakuScrollView;
@synthesize opisZnakuWebViewOne = opisZnakuWebViewOne;
@synthesize opisZnakuWebViewTwo = opisZnakuWebViewTwo;
@synthesize opisZnakuWebViewThree = opisZnakuWebViewThree;
@synthesize znakiarraytytuly = znakiarraytytuly;

-(IBAction)OpisZnakuMenuClicked:(id)sender {    
    [self dismissViewControllerAnimated:YES completion: nil];
}

-(IBAction)OpisZnakuBackClicked:(id)sender {
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    if ([appDelegate.historiaURLOpisyZnakow count]==1) {
        [self dismissViewControllerAnimated:YES completion: nil];
    } else {
        [appDelegate.historiaURLOpisyZnakow removeObjectAtIndex:([appDelegate.historiaURLOpisyZnakow count]-1)];
        toppos=[[appDelegate.historiaTopOpisyZnakow objectAtIndex:([appDelegate.historiaTopOpisyZnakow count]-1)] intValue];
        [appDelegate.historiaTopOpisyZnakow removeObjectAtIndex:([appDelegate.historiaTopOpisyZnakow count]-1)];
        if ([appDelegate.historiaURLOpisyZnakow count]==1 && appDelegate.znakimanypages && [appDelegate.level0OpisyZnakow count]>1) {
            
            [opisZnakuWebViewTwo removeFromSuperview];
            [opisZnakuWebViewThree removeFromSuperview];
            WKWebView *temp = opisZnakuWebViewTwo;
            opisZnakuWebViewTwo = opisZnakuWebViewThree;
            CGRect frame = opisZnakuScrollView.frame;
            frame.origin.x = opisZnakuScrollView.frame.size.width;
            frame.origin.y = 0;
            opisZnakuWebViewTwo.frame = frame;
            [opisZnakuScrollView addSubview:opisZnakuWebViewTwo];
            opisZnakuLabel.text = [znakiarraytytuly objectAtIndex:CurIndex];
            
            opisZnakuWebViewThree=temp;
            frame = opisZnakuScrollView.frame;
            frame.origin.x = opisZnakuScrollView.frame.size.width*2;
            frame.origin.y = 0;
            opisZnakuWebViewThree.frame = frame;
            [opisZnakuScrollView addSubview:opisZnakuWebViewThree];
            if (CurIndex==[appDelegate.level0OpisyZnakow count]-1) {
                [self loadPage:0 onPage:2];
            } else {
                [self loadPage:(int)(CurIndex+1) onPage:2];
            }
            
            [opisZnakuWebViewTwo setUIDelegate:self];
            [opisZnakuWebViewThree setUIDelegate:nil];
            
            [opisZnakuScrollView setScrollEnabled:YES];
            
            if ([appDelegate.level0OpisyZnakow count]>18) {
                opisZnakuPageControl.numberOfPages =18;
                opisZnakuPageControl.currentPage = (CurIndex)*18/[appDelegate.level0OpisyZnakow count];
            } else {
                opisZnakuPageControl.numberOfPages = [appDelegate.level0OpisyZnakow count];
                opisZnakuPageControl.currentPage = (CurIndex);
            }
            
            return;
            
        }
        [self display:nil:opisZnakuWebViewTwo:[appDelegate.historiaURLOpisyZnakow objectAtIndex:([appDelegate.historiaURLOpisyZnakow count]-1)]:-1];
    }
}

- (void)display :(NSString*)tosearch :(WKWebView*)wv :(NSString*)znak :(NSInteger)level0Pos
{
    if (wv==opisZnakuWebViewTwo) {
        opisZnakuLabel.alpha=0.2;
        [spinner startAnimating];
        
        
    }
    wv.navigationDelegate = self;
    
    dispatch_queue_t Queue = dispatch_queue_create("opisznakuqueue", NULL);
    dispatch_async(Queue, ^{
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        NSString *mystr = [NSString stringWithFormat:@"<html><head><style>html {-webkit-text-size-adjust: none; } body {width:%@px}</style><meta name = \"viewport\" content = \"minimum-scale=0.1, initial-scale = 1.0, maximum-scale=8.0, shrink-to-fit=YES\"></head><body>",[self getWidth:false]];
        NSRange x = [znak rangeOfString:@"q" options:0];
        const char *utfString;
        if (x.location!=NSNotFound) {
            dispatch_async(dispatch_get_main_queue(), ^{
                self->opisZnakuLabel.text = @"Historia i podstawa prawna";
            });
            
            int j =[[znak substringFromIndex:(x.location+1) ] intValue];
            int i =0;
            
            for (NSDictionary *key in [appDelegate.jsonObjects objectForKey:@"m"]) {
                for (NSDictionary *key2 in [key objectForKey:@"m"]) {
                    
                    if (i!=j) {
                        i++;
                        continue;
                    }
                    
                    mystr = [NSString stringWithFormat:@"%@%@<br>", mystr, [key2 objectForKey:@"o"]];
                    
                    NSString *prev = @"";
                    
                    for (NSDictionary *key3 in [key2 objectForKey:@"h"]) {
                        
                        
                        NSData *htmlData22 = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/kary/%@.jso", [[NSBundle mainBundle] bundlePath],[key3 objectForKey:@"m"]]];
                        
                        if ([prev isEqualToString:@"20110524"] && [[key3 objectForKey:@"m"] isEqualToString:@"20101231"]) {
                            mystr = [NSString stringWithFormat:@"%@<br>", mystr];
                        } else {
                            mystr = [NSString stringWithFormat:@"%@<br>%@; %@", mystr, [key3 objectForKey:@"m"], [key3 objectForKey:@"t"]];
                        }
                        prev = [NSString stringWithFormat:@"%@",[key3 objectForKey:@"m"]];
                        
                        if ([[key3 objectForKey:@"w"] isEqualToString:@"k.w."]) {
                            mystr = [NSString stringWithFormat:@"%@<div style=\"margin-left:30px\"><b>USTAWA z dnia 20 maja 1971 r. Kodeks Wykroczeń</b></div>", mystr];
                        } else {
                            id jsonObjects22 = [NSJSONSerialization JSONObjectWithData:htmlData22 options:NSJSONReadingMutableContainers error:nil];
                            
                            for (NSDictionary *key22 in [jsonObjects22 objectForKey:@"m"]) {
                                NSRange x = [[key22 objectForKey:@"s"] rangeOfString:[key3 objectForKey:@"w"] options:0];
                                
                                if (x.location==NSNotFound || x.location!=0) {
                                    continue;
                                }
                                
                                mystr = [NSString stringWithFormat:@"%@<div style=\"margin-left:30px\">%@<br><b>%@; %@</b></div>", mystr, [key22 objectForKey:@"o"],[key22 objectForKey:@"w"],[[[[[[[[[[[[[key22 objectForKey:@"s"]stringByReplacingOccurrencesOfString:@"c.p.g." withString:@"USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach"]                                                                                                                                                                        stringByReplacingOccurrencesOfString:@"k.k." withString:@"USTAWY z dnia 6 czerwca 1997 Kodeks Karny"]stringByReplacingOccurrencesOfString:@"k.w." withString:@"USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń"]stringByReplacingOccurrencesOfString:@"o.o.z.r." withString:@"ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach"]stringByReplacingOccurrencesOfString:@"p.r.d." withString:@"USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")"]stringByReplacingOccurrencesOfString:@"u.d.p." withString:@"USTAWY z dnia 21 marca 1985 r. o drogach publicznych"]stringByReplacingOccurrencesOfString:@"z.s.d." withString:@"ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych"]stringByReplacingOccurrencesOfString:@"u.t.d." withString:@"USTAWY z dnia 6 września 2001 r. o transporcie drogowym"]stringByReplacingOccurrencesOfString:@"h.p.s." withString:@"Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85"] stringByReplacingOccurrencesOfString:@"aetr" withString:@"Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r."] stringByReplacingOccurrencesOfString:@"r.u.j." withString:@"Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym"] stringByReplacingOccurrencesOfString:@"u.s.t.c" withString:@"USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych"]];
                                
                                break;
                            }
                        }
                    }
                    
                    i=-1;
                    
                    break;
                }
                if (i==-1) {
                    break;
                }
            }
        } else {
            NSArray *myWords = [[[[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@%@.htm", [NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"],znak] ] encoding:NSUTF8StringEncoding] stringByReplacingOccurrencesOfString:@"\r" withString:@""] componentsSeparatedByString:@"\n"];
            
            NSRange x = [znak rangeOfString:@"d/d39" options:0];
            NSRange y = [znak rangeOfString:@"d/d39a" options:0];
            
            if (x.location!=NSNotFound || y.location!=NSNotFound) {
                mystr = [NSString stringWithFormat:@"%@<center><b>%@</b><br><img src=%@_big.png></center>", mystr,[myWords objectAtIndex:0],znak];
            } else {
                mystr = [NSString stringWithFormat:@"%@<center><b>%@</b><br><img src=%@.png></center>", mystr,[myWords objectAtIndex:0],znak];
            }
            
            for (int i=3;i<[myWords count];i++) {
                mystr = [NSString stringWithFormat:@"%@%@ ", mystr,[myWords objectAtIndex:i]];
            }
            
            if ([tosearch length]!=0) {
                NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[NSRegularExpression escapedPatternForString:tosearch] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"] stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                
                NSRange r = [mystr rangeOfString:@"<body>" options:NSCaseInsensitiveSearch];
                if (r.location!=NSNotFound) {
                    mystr = [[NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL] stringByReplacingMatchesInString:mystr options:0 range:NSMakeRange(r.location,[mystr length]-r.location) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"];
                }
            }
            
            if ([[myWords objectAtIndex:2] length]>1) {
                NSString *mystr2 = [NSString stringWithFormat:@"%@",[appDelegate readNewTaryfikator2:[myWords objectAtIndex:2]:TRUE]];
                
                if ([mystr2 length]!=0) {
                    mystr = [NSString stringWithFormat:@"%@<table width=100%%><tr bgcolor=silver><td><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></td></tr>%@</table>", mystr,mystr2];
                }
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (wv==self->opisZnakuWebViewTwo) {
                    if ([[myWords objectAtIndex:0] rangeOfString:@"\"" options:0].location==NSNotFound) {
                        self->opisZnakuLabel.text = [NSString stringWithFormat:@"Znak %@ \"%@\"", [myWords objectAtIndex:1],[myWords objectAtIndex:0]];
                    } else {
                        self->opisZnakuLabel.text = [NSString stringWithFormat:@"Znak %@ %@", [myWords objectAtIndex:1],[myWords objectAtIndex:0]];
                    }
                }
                if (level0Pos!=-1 && [self->znakiarraytytuly objectAtIndex:level0Pos]==[NSNull null]) {
                    if ([[myWords objectAtIndex:0] rangeOfString:@"\"" options:0].location==NSNotFound) {
                        [self->znakiarraytytuly replaceObjectAtIndex:level0Pos withObject:[NSString stringWithFormat:@"Znak %@ \"%@\"", [myWords objectAtIndex:1],[myWords objectAtIndex:0]]];
                    } else {
                        [self->znakiarraytytuly replaceObjectAtIndex:level0Pos withObject:[NSString stringWithFormat:@"Znak %@ %@", [myWords objectAtIndex:1],[myWords objectAtIndex:0]]];
                    }
                    
                }
            });
        }
        
        utfString = [mystr UTF8String];
        
        NSData *htmlData2 = [NSData dataWithBytes: utfString length: strlen(utfString)];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [wv loadData:htmlData2 MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
        });
    });
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)webView:(WKWebView *)opisZnakuWebViewTwo didFinishNavigation:(WKNavigation *)navigation;
{
    if ([spinner isAnimating]) {
        [spinner stopAnimating];
        opisZnakuLabel.alpha=1;
        
        if (toppos!=-1) {
            [self.opisZnakuWebViewTwo evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, %li);",toppos] completionHandler:nil ];
        }
    }
}


- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
   
    self.edgesForExtendedLayout=UIRectEdgeNone;
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    opisZnakuLabel = [[UILabel alloc] initWithFrame:frame];
    opisZnakuLabel.backgroundColor = [UIColor clearColor];
    opisZnakuLabel.font = [UIFont boldSystemFontOfSize:14.0];
    opisZnakuLabel.numberOfLines = 4;
    opisZnakuLabel.textAlignment = NSTextAlignmentCenter;
    
    opisZnakuLabel.textColor = [UIColor blackColor];
    
    self.opisZnakuNavigationBar.topItem.titleView = opisZnakuLabel;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    
    toppos = -1;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    opisZnakuScrollView.pagingEnabled = YES;
    opisZnakuScrollView.showsHorizontalScrollIndicator = NO;
    opisZnakuScrollView.showsVerticalScrollIndicator = NO;
    opisZnakuScrollView.scrollsToTop = NO;
    
    if (appDelegate.znakimanypages && [appDelegate.level0OpisyZnakow count]>1) {
        opisZnakuScrollView.contentSize = CGSizeMake(opisZnakuScrollView.frame.size.width * 3, opisZnakuScrollView.frame.size.height);
        [opisZnakuScrollView scrollRectToVisible:CGRectMake(opisZnakuScrollView.frame.size.width,0,opisZnakuScrollView.frame.size.width,opisZnakuScrollView.frame.size.height) animated:NO];
        
        znakiarraytytuly = [[NSMutableArray alloc] init];
        for (unsigned i = 0; i < ([appDelegate.level0OpisyZnakow count]); i++) {
            [znakiarraytytuly addObject:[NSNull null]];
        }
        
        for (int i=0;i<([appDelegate.level0OpisyZnakow count]);i++) {
            if ([[appDelegate.level0OpisyZnakow objectAtIndex:i] isEqualToString:[appDelegate.historiaURLOpisyZnakow objectAtIndex:0]]) {
                CurIndex = i;
                break;
            }
        }
        
        opisZnakuWebViewTwo = [[WKWebView alloc] initWithFrame:opisZnakuScrollView.bounds];
        CGRect frame = opisZnakuScrollView.frame;
        frame.origin.x = opisZnakuScrollView.frame.size.width;
        frame.origin.y = 0;
        opisZnakuWebViewTwo.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewTwo];
        opisZnakuWebViewTwo.UIDelegate=self;
        [self loadPage:(int)CurIndex onPage:1];
        
        opisZnakuWebViewOne = [[WKWebView alloc] initWithFrame:opisZnakuScrollView.bounds];
        frame.origin.x = 0;
        frame.origin.y = 0;
        opisZnakuWebViewOne.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewOne];
        
        
        opisZnakuWebViewThree = [[WKWebView alloc] initWithFrame:opisZnakuScrollView.bounds];
        frame.origin.x = opisZnakuScrollView.frame.size.width*2;
        frame.origin.y = 0;
        opisZnakuWebViewThree.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewThree];
        
        if (CurIndex ==0) {
            [self loadPage:(int)([appDelegate.level0OpisyZnakow count]-1) onPage:0];
            [self loadPage:1 onPage:2];
        } else if (CurIndex==([appDelegate.level0OpisyZnakow count]-1)) {
            [self loadPage:(int)(CurIndex-1) onPage:0];
            [self loadPage:0 onPage:2];
        } else {
            [self loadPage:(int)(CurIndex-1) onPage:0];
            [self loadPage:(int)(CurIndex+1) onPage:2];
        }
        
        
        if ([appDelegate.level0OpisyZnakow count]>18) {
            opisZnakuPageControl.numberOfPages =18;
            opisZnakuPageControl.currentPage = (CurIndex)*18/[appDelegate.level0OpisyZnakow count];
        } else {
            opisZnakuPageControl.numberOfPages = [appDelegate.level0OpisyZnakow count];
            opisZnakuPageControl.currentPage = (CurIndex);
        }
        
    } else {
        opisZnakuScrollView.contentSize = CGSizeMake(opisZnakuScrollView.frame.size.width, opisZnakuScrollView.frame.size.height);
        
        opisZnakuWebViewTwo = [[WKWebView alloc] initWithFrame:opisZnakuScrollView.bounds];
        CGRect frame = opisZnakuScrollView.frame;
        frame.origin.x = 0;
        frame.origin.y = 0;
        opisZnakuWebViewTwo.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewTwo];
        opisZnakuWebViewTwo.UIDelegate=self;
        [self display:appDelegate.opisyznakowSearch:opisZnakuWebViewTwo:[appDelegate.historiaURLOpisyZnakow objectAtIndex:0]:-1];
        
        if (self.opisZnakuWebViewOne!=NULL) {
            frame.origin.x = 0;
            frame.origin.y = 0;
            opisZnakuWebViewOne.frame = frame;
        }
        if (self.opisZnakuWebViewThree!=NULL) {
            frame.origin.x = opisZnakuScrollView.frame.size.width*2;
            frame.origin.y = 0;
            opisZnakuWebViewThree.frame = frame;
        }
        
        opisZnakuPageControl.numberOfPages=1;
        opisZnakuPageControl.currentPage=0;
    }
}

- (void)loadPage:(int)index onPage:(int)page
{
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    if (page==0) {
        [self display:appDelegate.opisyznakowSearch:opisZnakuWebViewOne:[appDelegate.level0OpisyZnakow objectAtIndex:index]:index];
    } else if (page==1) {
        [self display:appDelegate.opisyznakowSearch:opisZnakuWebViewTwo:[appDelegate.level0OpisyZnakow objectAtIndex:index]:index];
    } else if (page==2) {
        [self display:appDelegate.opisyznakowSearch:opisZnakuWebViewThree:[appDelegate.level0OpisyZnakow objectAtIndex:index]:index];
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)sender
{
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    
    if (opisZnakuScrollView.contentOffset.x < opisZnakuScrollView.frame.size.width) {
        
        [opisZnakuWebViewOne removeFromSuperview];
        WKWebView *temp = opisZnakuWebViewTwo;
        opisZnakuWebViewTwo = opisZnakuWebViewOne;
        CGRect frame = opisZnakuScrollView.frame;
        frame.origin.x = opisZnakuScrollView.frame.size.width;
        frame.origin.y = 0;
        opisZnakuWebViewTwo.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewTwo];
        [opisZnakuScrollView scrollRectToVisible:CGRectMake(opisZnakuScrollView.frame.size.width,0,opisZnakuScrollView.frame.size.width,opisZnakuScrollView.frame.size.height) animated:NO];
        
        [opisZnakuWebViewThree removeFromSuperview];
        opisZnakuWebViewOne=opisZnakuWebViewThree;
        frame = opisZnakuScrollView.frame;
        frame.origin.x = 0;
        frame.origin.y = 0;
        opisZnakuWebViewOne.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewOne];
        if (CurIndex==0) {
            CurIndex=([appDelegate.level0OpisyZnakow count]-1);
        } else {
            CurIndex--;
        }
        if ([appDelegate.level0OpisyZnakow count]>18) {
            opisZnakuPageControl.currentPage = (CurIndex)*18/[appDelegate.level0OpisyZnakow count];
        } else {
            opisZnakuPageControl.currentPage = (CurIndex);
        }
        opisZnakuLabel.text = [znakiarraytytuly objectAtIndex:CurIndex];
        if (CurIndex==0) {
            [self loadPage:(int)[appDelegate.level0OpisyZnakow count]-1 onPage:0];
        } else {
            [self loadPage:(int)(CurIndex-1) onPage:0];
        }
        
        [temp removeFromSuperview];
        opisZnakuWebViewThree=temp;
        frame = opisZnakuScrollView.frame;
        frame.origin.x = opisZnakuScrollView.frame.size.width*2;
        frame.origin.y = 0;
        opisZnakuWebViewThree.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewThree];
        
        opisZnakuWebViewOne.UIDelegate=nil;
        opisZnakuWebViewTwo.UIDelegate=self;
        opisZnakuWebViewThree.UIDelegate=nil;
    } else if (opisZnakuScrollView.contentOffset.x > opisZnakuScrollView.frame.size.width) {
        
        [opisZnakuWebViewThree removeFromSuperview];
        WKWebView *temp = opisZnakuWebViewTwo;
        opisZnakuWebViewTwo = opisZnakuWebViewThree;
        CGRect frame = opisZnakuScrollView.frame;
        frame.origin.x = opisZnakuScrollView.frame.size.width;
        frame.origin.y = 0;
        opisZnakuWebViewTwo.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewTwo];
        [opisZnakuScrollView scrollRectToVisible:CGRectMake(opisZnakuScrollView.frame.size.width,0,opisZnakuScrollView.frame.size.width,opisZnakuScrollView.frame.size.height) animated:NO];
        
        [opisZnakuWebViewOne removeFromSuperview];
        opisZnakuWebViewThree=opisZnakuWebViewOne;
        frame = opisZnakuScrollView.frame;
        frame.origin.x = opisZnakuScrollView.frame.size.width*2;
        frame.origin.y = 0;
        opisZnakuWebViewThree.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewThree];
        CurIndex++;
        if (CurIndex==[appDelegate.level0OpisyZnakow count]) CurIndex=0;
        if ([appDelegate.level0OpisyZnakow count]>18) {
            opisZnakuPageControl.currentPage = (CurIndex)*18/[appDelegate.level0OpisyZnakow count];
        } else {
            opisZnakuPageControl.currentPage = (CurIndex);
        }
        opisZnakuLabel.text = [znakiarraytytuly objectAtIndex:CurIndex];
        if (CurIndex==[appDelegate.level0OpisyZnakow count]-1) {
            [self loadPage:0 onPage:2];
        } else {
            [self loadPage:(int)(CurIndex+1) onPage:2];
        }
        
        [temp removeFromSuperview];
        opisZnakuWebViewOne=temp;
        frame = opisZnakuScrollView.frame;
        frame.origin.x = 0;
        frame.origin.y = 0;
        opisZnakuWebViewOne.frame = frame;
        [opisZnakuScrollView addSubview:opisZnakuWebViewOne];
        
        opisZnakuWebViewOne.UIDelegate=nil;
        opisZnakuWebViewTwo.UIDelegate=self;
        opisZnakuWebViewThree.UIDelegate=nil;
    }
}

-(NSString *)getWidth:(bool)or {
    UIDeviceOrientation orientation=[[UIDevice currentDevice]orientation];
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*0.90) ];
    }
    
    float notchFix = 0;
    if (UIApplication.sharedApplication.windows.firstObject.safeAreaInsets.bottom>0 &&
        (orientation == UIInterfaceOrientationLandscapeLeft ||
         orientation == UIInterfaceOrientationLandscapeRight)) {
        notchFix = 0.09;
    }
    
    return [NSString stringWithFormat:@"%i",(int)(opisZnakuScrollView.bounds.size.width*(0.95-notchFix)) ];
}


-(void)OrientationDidChange:(NSNotification*)notification
{
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    
    self.opisZnakuScrollView.contentSize = CGSizeMake(opisZnakuScrollView.frame.size.width*3 , opisZnakuScrollView.frame.size.height);
    CGRect frame = self.opisZnakuScrollView.frame;
    if (self.opisZnakuWebViewOne!=NULL) {
        frame.origin.x = 0;
        frame.origin.y = 0;
        self.opisZnakuWebViewOne.frame = frame;
        [opisZnakuWebViewOne evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
        
    }
    
    frame.origin.x = self.opisZnakuScrollView.frame.size.width;
    frame.origin.y = 0;
    self.opisZnakuWebViewTwo.frame = frame;
    [opisZnakuWebViewTwo evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
    
    
    if (self.opisZnakuWebViewThree!=NULL) {
        frame.origin.x = self.opisZnakuScrollView.frame.size.width*2;
        frame.origin.y = 0;
        self.opisZnakuWebViewThree.frame = frame;
        [opisZnakuWebViewThree evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
        
    }
    
    [self.opisZnakuScrollView scrollRectToVisible:CGRectMake(self.opisZnakuScrollView.frame.size.width,0,self.opisZnakuScrollView.frame.size.width,self->opisZnakuScrollView.frame.size.height) animated:NO];
}

- (void)webView:(WKWebView *)opisZnakuWebViewTwo decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
{
    if (navigationAction.navigationType == WKNavigationTypeLinkActivated) {
        NSRange x = [[[navigationAction.request URL] absoluteString] rangeOfString:@"http" options:0];
        
        if (x.location!=NSNotFound) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[[navigationAction.request URL] absoluteString]] options:@{} completionHandler:^(BOOL success) {}];
            decisionHandler ( WKNavigationActionPolicyCancel);
            return;
        }
        
        if ([spinner isAnimating]) {
            decisionHandler (WKNavigationActionPolicyCancel);
            return;
        }
        
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        if ([[appDelegate.historiaURLOpisyZnakow objectAtIndex:([appDelegate.historiaURLOpisyZnakow count]-1)] isEqualToString:[[[navigationAction.request URL]  relativePath] substringFromIndex:NSMaxRange([[[navigationAction.request URL]  relativePath] rangeOfString:@".app/assets/"])]]) {
            decisionHandler (WKNavigationActionPolicyCancel);
            return;
        }
        
        [self.opisZnakuWebViewTwo stopLoading];
        
        
        [self.opisZnakuWebViewTwo evaluateJavaScript:@"window.pageYOffset;" completionHandler:^(id result, NSError *error) {
            if(result){
                [appDelegate.historiaTopOpisyZnakow addObject:result];
            }
        }];
        
        toppos=-1;
        
        opisZnakuPageControl.numberOfPages = 1;
        opisZnakuPageControl.currentPage = 0;
        
        if (appDelegate.znakimanypages && [appDelegate.level0OpisyZnakow count]>1 && [appDelegate.historiaURLOpisyZnakow count]==1) {
            
            [appDelegate.historiaURLOpisyZnakow removeAllObjects];
            [appDelegate.historiaURLOpisyZnakow addObject:[appDelegate.level0OpisyZnakow objectAtIndex:CurIndex]];
            
            [opisZnakuScrollView setScrollEnabled:NO];
            
            [self.opisZnakuWebViewTwo removeFromSuperview];
            [opisZnakuWebViewThree removeFromSuperview];
            
            WKWebView *temp = self.opisZnakuWebViewTwo;
            self.opisZnakuWebViewTwo = self.opisZnakuWebViewThree;
            CGRect frame = self.opisZnakuScrollView.frame;
            frame.origin.x = opisZnakuScrollView.frame.size.width;
            frame.origin.y = 0;
            self.opisZnakuWebViewTwo.frame = frame;
            [self.opisZnakuWebViewTwo evaluateJavaScript:@"document.open();document.close()" completionHandler:nil];
            
            [self.opisZnakuScrollView addSubview:self.opisZnakuWebViewTwo];
            
            opisZnakuWebViewThree=temp;
            frame = opisZnakuScrollView.frame;
            frame.origin.x = opisZnakuScrollView.frame.size.width*2;
            frame.origin.y = 0;
            opisZnakuWebViewThree.frame = frame;
            [opisZnakuScrollView addSubview:opisZnakuWebViewThree];
            
            [self.opisZnakuWebViewTwo setUIDelegate:self];
        }
        
        [appDelegate.historiaURLOpisyZnakow addObject:[[[navigationAction.request URL]  relativePath] substringFromIndex:NSMaxRange([[[navigationAction.request URL]  relativePath] rangeOfString:@".app/assets/"])] ];
        
        [self display:nil:self.opisZnakuWebViewTwo:[appDelegate.historiaURLOpisyZnakow objectAtIndex:([appDelegate.historiaURLOpisyZnakow count]-1)]:-1];
        
        decisionHandler (WKNavigationActionPolicyCancel);
        return;
    }
    
    decisionHandler (WKNavigationActionPolicyAllow);
}

@end
