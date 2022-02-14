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
    
    [_inneWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];
    
    if (searchcurr==1) {
        inneLeftButton.enabled = FALSE;
    }
    inneRightButton.enabled =  TRUE;
}

-(IBAction)inneRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_inneWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];

    if (searchcurr==searchall) {
        inneRightButton.enabled = FALSE;
    }
    if (searchall!=1) {
        inneLeftButton.enabled = TRUE;
    }
}

- (BOOL)webView:(UIWebView*)inneWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType {
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        NSRange x = [[[request URL] absoluteString] rangeOfString:@"http" options:0];
        
        if (x.location!=NSNotFound) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[[request URL] absoluteString]]];
            return NO;
        }
        
        if ([spinner isAnimating]) return YES;
        
        [_inneWebView stopLoading];
        
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
        
        [self performSegueWithIdentifier:@"PokazZnak3Segue" sender:self];
        
        return YES;
    }
    return YES;
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
            NSArray *array = [NSArray arrayWithObjects:@"alkohol/alkoinfo",@"alkohol/alkolicz",@"kierruch",@"klima",@"nr",@"oleje",@"opony/opony",@"prawko",@"",@"speed/sp_licz",@"speed/sp_pom",@"adr/adr",@"adr/adr2",@"adr/adr3",@"linki",@"wyppoj",nil];
            
            NSData *htmlData;
            NSString* mystr;
            const char *utfString;
            
            if (nr==8) {
                AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
                
                mystr = @"<html><head><style>html {-webkit-text-size-adjust: none; }</style></head><body><center><img src=d/d39_big.png></center>";
                
                htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/d/d39.htm", [[NSBundle mainBundle] bundlePath]]];
                
                NSString* newStr = [[NSString alloc] initWithData:htmlData encoding:NSUTF8StringEncoding];
                
                NSArray *myWords = [[newStr stringByReplacingOccurrencesOfString:@"\r" withString:@""] componentsSeparatedByString:@"\n"];
                
                for (int i=3;i<[myWords count];i++) {
                    mystr = [NSString stringWithFormat:@"%@%@ ", mystr,[myWords objectAtIndex:i]];
                }
                
                mystr = [NSString stringWithFormat:@"%@<table><tr bgcolor=silver><td><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></td></tr>%@</table>", mystr,[NSString stringWithFormat:@"%@",[appDelegate readNewTaryfikator2:[myWords objectAtIndex:2]:TRUE]]];
            } else {
                htmlData = [NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm", [[NSBundle mainBundle] bundlePath],[array objectAtIndex:nr]]];
                
                mystr = [[NSString alloc] initWithData:htmlData encoding:NSUTF8StringEncoding];
            }
            
            NSRange r = [mystr rangeOfString:@"</head>"];
            if (r.location!=NSNotFound) {
                mystr = [NSString  stringWithFormat:@"%@",[mystr stringByReplacingOccurrencesOfString:@"</head>" withString:@"<style>html {-webkit-text-size-adjust: none; }</style><meta name = \"viewport\" content = \"minimum-scale=0.4, initial-scale = 1.0, maximum-scale=4.0 user-scalable = yes\"></head>" options:0 range:r]];
            }
            
            searchcurr=0;
            searchall=0;
            
            if ([t length]!=0) {
                NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:t] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"]
stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"]stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                
                NSRange r = [mystr rangeOfString:@"<body>" options:NSCaseInsensitiveSearch];
                if (r.location!=NSNotFound) {
                    NSString *temp = [[NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL] stringByReplacingMatchesInString:mystr options:0 range:NSMakeRange(r.location,[mystr length]-r.location) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"];
                    if ((([temp length] - [mystr length])%43)==0) {
                       
                        searchall = ([temp length] - [mystr length])/43;
                            
                        utfString = [[temp stringByReplacingOccurrencesOfString:@"<body>" withString:@"<body><script type=\"text/javascript\">function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script>" options:0 range:r] UTF8String];
    
                    } else {
                        utfString = [temp UTF8String];
                    }
                } else {
                    utfString = [mystr UTF8String];
                }
            } else {
                utfString = [mystr UTF8String];
            }
            
            htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (searchall!=0) {
                    inneRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Inne (%li)",searchall]];
                }
                inneChangeButton.enabled = TRUE;
                
                [_inneWebView loadData:htmlData MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
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

-(void)webViewDidFinishLoad:(UIWebView *)inneWebView
{
    [spinner stopAnimating];
    inneLabel.alpha=1;
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        [self.inneRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
        [self.inneRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        [self.inneLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
         [self.inneLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        
        
        self.inneNavigationBar.barTintColor = [UIColor whiteColor];
        self.inneSearchBar.barTintColor = [UIColor whiteColor];
      
        self.edgesForExtendedLayout=UIRectEdgeNone;
        [self prefersStatusBarHidden];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    inneLabel = [[UILabel alloc] initWithFrame:frame];
    inneLabel.backgroundColor = [UIColor clearColor];
    inneLabel.font = [UIFont boldSystemFontOfSize:14.0];
    inneLabel.numberOfLines = 2;
    inneLabel.textAlignment = NSTextAlignmentCenter;
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        inneLabel.textColor = [UIColor blackColor];
    } else {
        inneLabel.textColor = [UIColor whiteColor];
    }
    inneLabel.text = @"Alkohol (informacje)";
    self.inneNavigationBar.topItem.titleView = inneLabel;
    
    nr = 0;
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.controllerinne=self;
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    } else {
        spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    }
    spinner.hidesWhenStopped = YES;
    [self.view addSubview:spinner];
    
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
