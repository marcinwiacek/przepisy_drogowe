//
//  TrescViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "TrescViewController.h"
#import "AppDelegate.h"

@interface TrescViewController ()

@end

@implementation TrescViewController


@synthesize trescWebView = _trescWebView;
@synthesize trescSearchBar = trescSearchBar;
@synthesize trescNavigationBar = _trescNavigationBar;
@synthesize nr_akt = nr_akt;
@synthesize nr_rozdzial = nr_rozdzial;
@synthesize trescLabel = trescLabel;
@synthesize trescLeftButton = trescLeftButton;
@synthesize trescRightButton = trescRightButton;
@synthesize trescChangeButton = trescChangeButton;

- (void)webView:(WKWebView *)trescWebView
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
        
        decisionHandler (WKNavigationActionPolicyCancel);
        return;
    }
    
    decisionHandler (WKNavigationActionPolicyAllow);
}


-(IBAction)trescLeftButtonMenuClicked:(id)sender {
    if (searchcurr>1) {
        searchcurr--;
    }
    
    [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==1) {
        trescLeftButton.enabled = FALSE;
    }
    trescRightButton.enabled =  TRUE;
}

-(IBAction)trescRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)] completionHandler:nil];
    
    if (searchcurr==searchall) {
        trescRightButton.enabled = FALSE;
    }
    if (searchall!=1) {
        trescLeftButton.enabled = TRUE;
    }
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

- (void)display
{
    if (old_akt == nr_akt) {
        if (nr_rozdzial!=-1) {
            [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial+1)] completionHandler:nil];
        }
        return;
    }
    old_akt = nr_akt;
    
    trescLabel.alpha=0.2;
    [spinner startAnimating];
    
    NSString *t = trescSearchBar.text;
    [self.tabBarItem setTitle:@"Treść"];
    
    trescLeftButton.enabled = FALSE;
    trescRightButton.enabled = FALSE;
    trescChangeButton.enabled = FALSE;
    
    dispatch_queue_t Queue = dispatch_queue_create("trescqueue", NULL);
    
    dispatch_async(Queue, ^{
        @autoreleasepool {
            NSArray *array = [NSArray arrayWithObjects:@"tekst/kodeks",@"tekst/kierpoj",@"tekst/rozp2012",@"tekst/rozp2002",nil];
            const char *utfString;
            
            NSString* mystr = [[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm", [[NSBundle mainBundle] bundlePath],[array objectAtIndex:self->nr_akt]]] encoding:NSUTF8StringEncoding];

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
            
            NSData *htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                if (self->searchall!=0) {
                    self->trescRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Treść (%li)",self->searchall]];
                }
                self->trescChangeButton.enabled = TRUE;
                
                self->_trescWebView.alpha=1;
                
                [self->_trescWebView loadData:htmlData MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
            });
            
        }
    });
}

- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)trescSearchBar {
    if ([spinner isAnimating]) return NO;
    return YES;
}

- (void)searchBarSearchButtonClicked:(UISearchBar *)trescSearchBar {
    [self.trescSearchBar endEditing:YES];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar *)trescSearchBar
{
    old_akt =-1;
    nr_rozdzial=-1;
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

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];
    
    self.trescNavigationBar.barTintColor = [UIColor whiteColor];
    self.trescSearchBar.barTintColor = [UIColor whiteColor];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    trescLabel = [[UILabel alloc] initWithFrame:frame];
    trescLabel.backgroundColor = [UIColor clearColor];
    trescLabel.font = [UIFont boldSystemFontOfSize:14.0];
    trescLabel.numberOfLines = 2;
    trescLabel.textAlignment = NSTextAlignmentCenter;
    trescLabel.textColor = [UIColor blackColor];
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        trescLabel.text = @"Rozporządzenie w sprawie postępowania z kierowcami (2012)";
    } else {
        trescLabel.text = @"Rozp. w sprawie post. z kier. (2012)";
    }
    self.trescNavigationBar.topItem.titleView = trescLabel;
    
    old_akt = -1;
    nr_akt = 0;
    nr_rozdzial = -1;
    
    nr_op=0;
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.controllertresc=self;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    spinner.hidesWhenStopped = YES;
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [self.view addSubview:spinner];
    
    _trescWebView.navigationDelegate = self;
    
    [self display];
}

-(void)OrientationDidChange:(NSNotification*)notification
{
   spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
    [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2, 22);
     [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
    
}

- (void)webView:(WKWebView *)trescWebView didFinishNavigation:(WKNavigation *)navigation;
{
    [spinner stopAnimating];
    trescLabel.alpha=1;
    if (nr_rozdzial!=-1) {
        [_trescWebView evaluateJavaScript:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial+1)] completionHandler:nil];
    }
}


@end
