//
//  InneViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "InneViewController.h"
#import "AppDelegate.h"

@interface InneViewController ()

@end

@implementation InneViewController

@synthesize inneWebView = _inneWebView;
@synthesize inneNavigationBar = _inneNavigationBar;
@synthesize nr = nr;
@synthesize inneSearchBar = inneSearchBar;
@synthesize inneLabel = inneLabel;
@synthesize inneLeftButton = inneLeftButton;
@synthesize inneRightButton = inneRightButton;
@synthesize inneChangeButton = inneChangeButton;

-(IBAction)inneLeftButtonMenuClicked:(id)sender {
    if (searchcurr>1) {
        searchcurr--;
    }
    
    [_inneWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==1) {
        inneLeftButton.enabled = FALSE;
    }
    inneRightButton.enabled =  TRUE;
}

-(IBAction)inneRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_inneWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==searchall) {
        inneRightButton.enabled = FALSE;
    }
    if (searchall!=1) {
        inneLeftButton.enabled = TRUE;
    }
}

- (void)webView:(WKWebView *)inneWebView
decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
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
        
        [_inneWebView stopLoading];
        
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
        
        [self performSegueWithIdentifier:@"PokazZnak3Segue" sender:self];
        
        
        decisionHandler (WKNavigationActionPolicyCancel);
        return;
    }
    
    decisionHandler (WKNavigationActionPolicyAllow);
}

- (void)display
{
    inneLabel.alpha=0.2;
    [spinner startAnimating];
    
    NSString *t = inneSearchBar.text;
    [self.tabBarItem setTitle:@"Inne"];
    
    inneLeftButton.enabled = FALSE;
    inneRightButton.enabled = FALSE;
    inneChangeButton.enabled = FALSE;
    
    dispatch_queue_t Queue = dispatch_queue_create("innequeue", NULL);
    dispatch_async(Queue, ^{
        @autoreleasepool {
            NSArray *array = [NSArray arrayWithObjects:@"nr",@"alkohol/alkoinfo",@"alkohol/alkolicz",@"kierruch",@"klima",@"oleje",@"opony/opony",@"prawko",@"",@"speed/sp_licz",@"speed/sp_pom",@"adr/adr",@"adr/adr2",@"adr/adr3",@"linki",@"wyppoj",nil];
            
            NSData *htmlData;
            NSString* mystr;
            const char *utfString;
            
            if (self.nr==8) {
                AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
                
                mystr = @"<html><head></head><body><center><img src=d/d39_big.png></center>";
                
                htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/d/d39.htm", [[NSBundle mainBundle] bundlePath]]];
                
                NSString* newStr = [[NSString alloc] initWithData:htmlData encoding:NSUTF8StringEncoding];
                
                NSArray *myWords = [[newStr stringByReplacingOccurrencesOfString:@"\r" withString:@""] componentsSeparatedByString:@"\n"];
                
                for (int i=3;i<[myWords count];i++) {
                    mystr = [NSString stringWithFormat:@"%@%@ ", mystr,[myWords objectAtIndex:i]];
                }
                
                mystr = [NSString stringWithFormat:@"%@<table><tr bgcolor=silver><td><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></td></tr>%@</table>", mystr,[NSString stringWithFormat:@"%@",[appDelegate readNewTaryfikator2:[myWords objectAtIndex:2]:TRUE]]];
            } else {
                htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm", [[NSBundle mainBundle] bundlePath],[array objectAtIndex:self->nr]]];
                
                mystr = [[NSString alloc] initWithData:htmlData encoding:NSUTF8StringEncoding];
            }
            
            self->searchcurr=0;
            self->searchall = 0;
            
            if ([t length]!=0) {
                NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:t]
                    stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"]
                    stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"]
                    stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                
                NSString *temp = [[NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL] stringByReplacingMatchesInString:mystr options:0 range:NSMakeRange(0, [mystr length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"];
                
                if ((([temp length] - [mystr length])%43)==0) {
                    self->searchall = ([temp length] - [mystr length])/43;
                    NSRange r = [mystr rangeOfString:@"</head>"];
                    mystr = [temp stringByReplacingOccurrencesOfString:@"</head>" withString:@"<script type=\"text/javascript\">function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script></head>" options:0 range:r];
                }
            }
            NSRange r = [mystr rangeOfString:@"</head>"];
            if (r.location!=NSNotFound) {
                utfString = [[mystr stringByReplacingOccurrencesOfString:@"</head>" withString:[NSString stringWithFormat:@"<style>html {-webkit-text-size-adjust: none; } body {width:%@px}</style><meta name = \"viewport\" content = \"minimum-scale=0.1, initial-scale = 1.0, maximum-scale=8.0, shrink-to-fit=YES\"></head>",[self getWidth:false]] options:0 range:r] UTF8String];
            } else {
                utfString = [mystr UTF8String];
            }
            
            htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (self->searchall!=0) {
                    self.inneRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Inne (%li)",self->searchall]];
                }
                self.inneChangeButton.enabled = TRUE;
                
                [self->_inneWebView loadData:htmlData MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
            });
            
        };
        
    });
}

- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)inneSearchBar {
    if ([spinner isAnimating]) return NO;
    return YES;
}


- (void)searchBarSearchButtonClicked:(UISearchBar *)inneSearchBar {
    [self.inneSearchBar endEditing:YES];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar *)inneSearchBar
{
    [self display];
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

- (void)webView:(WKWebView *)inneWebView didFinishNavigation:(WKNavigation *)navigation;
{
    [spinner stopAnimating];
    inneLabel.alpha=1;
    [_inneWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:false]] completionHandler:nil];
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
    
  //  [self.inneRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
  //  [self.inneRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    
  //  [self.inneLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
  //  [self.inneLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    
    self.inneNavigationBar.barTintColor = [UIColor whiteColor];
    self.inneSearchBar.barTintColor = [UIColor whiteColor];
  //  [self prefersStatusBarHidden];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    inneLabel = [[UILabel alloc] initWithFrame:frame];
    inneLabel.backgroundColor = [UIColor clearColor];
    inneLabel.font = [UIFont boldSystemFontOfSize:14.0];
    inneLabel.numberOfLines = 2;
    inneLabel.textAlignment = NSTextAlignmentCenter;
    inneLabel.textColor = [UIColor blackColor];
    inneLabel.text = @"Alarmowe";
    
    self.inneNavigationBar.topItem.titleView = inneLabel;
    
    nr = 0;
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.controllerinne=self;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    spinner.hidesWhenStopped = YES;
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [self.view addSubview:spinner];
    
    _inneWebView.navigationDelegate = self;
   
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
    [_inneWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
   
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
     [_inneWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
}

@end
