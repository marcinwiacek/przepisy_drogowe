//
//  AboutViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/22/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "AboutViewController.h"
#import <MessageUI/MessageUI.h>

@interface AboutViewController ()

@end

@implementation AboutViewController

@synthesize aboutWebView = _aboutWebView;
@synthesize aboutLabel = aboutLabel;
@synthesize aboutNavigationBar = aboutNavigationBar;
@synthesize aboutMailButton = aboutMailButton;

-(IBAction)AboutExitClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion: nil];
}

-(IBAction)AboutEmailClicked:(id)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString stringWithFormat:@"mailto:marcin@mwiacek.com?Subject=Przepisy+drogowe+%@+iOS+%@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"],[[UIDevice currentDevice] systemVersion]]] options:@{} completionHandler:^(BOOL success) {}];
}

- (void)webView:(WKWebView *)aboutWebView
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

- (void)display
{
    [spinner startAnimating];
    
    dispatch_queue_t Queue = dispatch_queue_create("aboutqueue", NULL);
    dispatch_async(Queue, ^{
        NSData *htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/about.htm", [[NSBundle mainBundle] bundlePath]]];
        
        NSString* mystr = [[NSString alloc] initWithData:htmlData encoding:NSUTF8StringEncoding];
        
        NSRange r = [mystr rangeOfString:@"</head>"];
        if (r.location!=NSNotFound) {
            mystr = [NSString  stringWithFormat:@"%@",[mystr stringByReplacingOccurrencesOfString:@"</head>" withString:[NSString stringWithFormat:@"<style>html {-webkit-text-size-adjust: none; } body {width:%@px}</style><meta name = \"viewport\" content = \"minimum-scale=0.1, initial-scale = 1.0, maximum-scale=8.0, shrink-to-fit=YES\"></head>",[self getWidth:false]] options:0 range:r]];
        }
        const char *utfString = [mystr UTF8String];
        
        
        htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
        
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [self->_aboutWebView loadData:htmlData MIMEType:@"text/html" characterEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
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

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(OrientationDidChange:) name:UIDeviceOrientationDidChangeNotification object:nil];

    [self prefersStatusBarHidden];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    aboutLabel = [[UILabel alloc] initWithFrame:frame];
    aboutLabel.backgroundColor = [UIColor clearColor];
    aboutLabel.font = [UIFont boldSystemFontOfSize:14.0];
    aboutLabel.numberOfLines = 4;
    aboutLabel.textAlignment = NSTextAlignmentCenter;
    aboutLabel.text = [NSString stringWithFormat:@"Przepisy drogowe %@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]];
    
    aboutLabel.textColor = [UIColor blackColor];
    
    self.aboutNavigationBar.topItem.titleView = aboutLabel;
    
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleMedium];
    
   spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2,22);
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    
    _aboutWebView.navigationDelegate = self;
    
    [self display];
    
    if (![[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:[NSString stringWithFormat:@"mailto:marcin@mwiacek.com?Subject=Przepisy+drogowe+%@+iOS+%@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"],[[UIDevice currentDevice] systemVersion]]]]) {
        aboutMailButton.enabled=false;
    }
}

-(NSString *)getWidth:(bool)or {
    UIDeviceOrientation orientation=[[UIDevice currentDevice]orientation];
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        /*if (or) {
            return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.height*0.90) ];
            
        }*/
        return [NSString stringWithFormat:@"%i",(int)(UIScreen.mainScreen.bounds.size.width*0.90) ];
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
    [_aboutWebView evaluateJavaScript:[NSString stringWithFormat:@"document.body.style.width='%@px';",[self getWidth:true]] completionHandler:nil];
}

- (void)webView:(WKWebView *)aboutWebView didFinishNavigation:(WKNavigation *)navigation;
{
    [spinner stopAnimating];
}


@end
