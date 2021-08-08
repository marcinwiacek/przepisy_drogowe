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
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString stringWithFormat:@"mailto:marcin@mwiacek.com?Subject=Przepisy+drogowe+%@+iOS+%@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"],[[UIDevice currentDevice] systemVersion]]]];
}

- (BOOL)webView:(UIWebView*)aboutWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType {
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        NSRange x = [[[request URL] absoluteString] rangeOfString:@"http" options:0];
        
        if (x.location!=NSNotFound) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[[request URL] absoluteString]]];
            return NO;
        }
        
        return YES;
    }
    return YES;
}

- (void)display
{
    [spinner startAnimating];
    
    dispatch_queue_t Queue = dispatch_queue_create("aboutqueue", NULL);
    dispatch_async(Queue, ^{        
          NSData *htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/about.htm", [[NSBundle mainBundle] bundlePath]]];
        
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            [_aboutWebView loadData:htmlData MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
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

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        self.edgesForExtendedLayout=UIRectEdgeNone;
        [self prefersStatusBarHidden];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    aboutLabel = [[UILabel alloc] initWithFrame:frame];
    aboutLabel.backgroundColor = [UIColor clearColor];
    aboutLabel.font = [UIFont boldSystemFontOfSize:14.0];
    aboutLabel.numberOfLines = 4;
    aboutLabel.textAlignment = NSTextAlignmentCenter;
    aboutLabel.text = [NSString stringWithFormat:@"Przepisy drogowe %@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]];
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        aboutLabel.textColor = [UIColor blackColor];
    } else {
        aboutLabel.textColor = [UIColor whiteColor];
    }
    
    self.aboutNavigationBar.topItem.titleView = aboutLabel;

    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
         spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    } else {
        spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    }
    
    UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
    if(orientation == UIInterfaceOrientationPortrait ||
       orientation == UIInterfaceOrientationPortraitUpsideDown) {
        spinner.center = CGPointMake(CGRectGetWidth([[UIScreen mainScreen] bounds])/2,22);
    } else  {
        spinner.center = CGPointMake(CGRectGetHeight([[UIScreen mainScreen] bounds])/2, 22);
    }
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    
    [self display];
    
    if (![[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:[NSString stringWithFormat:@"mailto:marcin@mwiacek.com?Subject=Przepisy+drogowe+%@+iOS+%@",[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"],[[UIDevice currentDevice] systemVersion]]]]) {
        aboutMailButton.enabled=false;
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

-(void)webViewDidFinishLoad:(UIWebView *)aboutWebView{
    [spinner stopAnimating];
}


@end
