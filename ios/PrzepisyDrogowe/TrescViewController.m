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


-(IBAction)trescLeftButtonMenuClicked:(id)sender {
    if (searchcurr>1) {
        searchcurr--;
    }
    
    [_trescWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];
    
    if (searchcurr==1) {
        trescLeftButton.enabled = FALSE;
    }
    trescRightButton.enabled =  TRUE;
}

-(IBAction)trescRightButtonMenuClicked:(id)sender {
    if (searchcurr<searchall) {
        searchcurr++;
    }
    
    [_trescWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(%li)));",(searchcurr-1)]];
    
    if (searchcurr==searchall) {
        trescRightButton.enabled = FALSE;
    }
    if (searchall!=1) {
        trescLeftButton.enabled = TRUE;
    }
}

- (void)display
{
    if (old_akt == nr_akt) {
        if (nr_rozdzial!=-1) {
            [_trescWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial+1)]];
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
            NSArray *array = [NSArray arrayWithObjects:@"tekst/rozp2012",@"tekst/kodeks",@"tekst/kierpoj",@"tekst/rozp2002",nil];
            const char *utfString;
            
            NSString* mystr = [[NSString alloc] initWithData:[NSData dataWithContentsOfFile:[NSString stringWithFormat:@"%@/assets/%@.htm", [[NSBundle mainBundle] bundlePath],[array objectAtIndex:nr_akt]]] encoding:NSUTF8StringEncoding];
            
            if ([t length]!=0) {
                NSString *reg = [NSString  stringWithFormat:@"(?![^<]+>)((?i:%@))",[[[[[[[[[NSRegularExpression escapedPatternForString:t] stringByReplacingOccurrencesOfString:@"a" withString:@"[a\\u0105]"]
 stringByReplacingOccurrencesOfString:@"c" withString:@"[c\\u0107]"]stringByReplacingOccurrencesOfString:@"e" withString:@"[e\\u0119]"] stringByReplacingOccurrencesOfString:@"l" withString:@"[l\\u0142]"] stringByReplacingOccurrencesOfString:@"n" withString:@"[n\\u0144]"] stringByReplacingOccurrencesOfString:@"o" withString:@"[o\\u00f3]"] stringByReplacingOccurrencesOfString:@"s" withString:@"[s\\u015b]"] stringByReplacingOccurrencesOfString:@"z" withString:@"[z\\u017c\\u017a]"] ];
                                                                                     
             
                NSString *temp = [[NSRegularExpression regularExpressionWithPattern:reg options:0 error:NULL] stringByReplacingMatchesInString:mystr options:0 range:NSMakeRange(0, [mystr length]) withTemplate:@"<ins style='background-color:yellow'>$1</ins>"];

                if ((([temp length] - [mystr length])%43)==0) {
                    NSRange r = [temp rangeOfString:@"<body>" options: NSCaseInsensitiveSearch];
                    
                    if (r.location!=NSNotFound) {
                        searchall = ([temp length] - [mystr length])/43;
                                               
                        utfString = [[temp stringByReplacingOccurrencesOfString:@"<body>" withString:@"<body><style>html {-webkit-text-size-adjust: none; }</style><script type=\"text/javascript\">function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script>" options:0 range:r] UTF8String];
                    } else {
                         utfString = [temp UTF8String];
                    }
                } else {
                    NSRange r = [temp rangeOfString:@"</head>"];
                    if (r.location!=NSNotFound) {
                        temp = [NSString  stringWithFormat:@"%@",[temp stringByReplacingOccurrencesOfString:@"</head>" withString:@"<style>html {-webkit-text-size-adjust: none; }</style></head>" options:0 range:r]];
                    }
                    
                    utfString = [temp UTF8String];
                }

            } else {
                NSRange r = [mystr rangeOfString:@"</head>"];
                if (r.location!=NSNotFound) {
                    utfString = [[mystr stringByReplacingOccurrencesOfString:@"</head>" withString:@"<style>html {-webkit-text-size-adjust: none; }</style></head>" options:0 range:r] UTF8String];
                } else {
                    utfString = [mystr UTF8String];

                }
                    
                searchall=0;
            }
            searchcurr=0;
            
            NSData *htmlData = [NSData dataWithBytes: utfString length: strlen(utfString)];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                if (searchall!=0) {
                    trescRightButton.enabled = TRUE;
                    [self.tabBarItem setTitle:[NSString stringWithFormat:@"Treść (%li)",searchall]];
                }
                trescChangeButton.enabled = TRUE;
                
                _trescWebView.alpha=1;

                [_trescWebView loadData:htmlData MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@%@", [[NSBundle mainBundle] resourcePath],@"/assets/"] isDirectory:YES]];
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
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        [self.trescRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
        [self.trescRightButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        [self.trescLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateDisabled barMetrics:UIBarMetricsDefault];
        [self.trescLeftButton setBackgroundImage:[UIImage imageNamed:@"white.png"] forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
        
        self.trescNavigationBar.barTintColor = [UIColor whiteColor];
        self.trescSearchBar.barTintColor = [UIColor whiteColor];
        self.edgesForExtendedLayout=UIRectEdgeNone;
        [self prefersStatusBarHidden];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    trescLabel = [[UILabel alloc] initWithFrame:frame];
    trescLabel.backgroundColor = [UIColor clearColor];
    trescLabel.font = [UIFont boldSystemFontOfSize:14.0];
    trescLabel.numberOfLines = 2;
    trescLabel.textAlignment = NSTextAlignmentCenter;
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        trescLabel.textColor = [UIColor blackColor];
    } else {
        trescLabel.textColor = [UIColor whiteColor];
    }
    if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
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

-(void)webViewDidFinishLoad:(UIWebView *)trescWebView
{
    [spinner stopAnimating];
    trescLabel.alpha=1;
    if (nr_rozdzial!=-1) {
        [_trescWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.scrollTo(0, document.getElementById('bok%li').offsetTop);",(nr_rozdzial+1)]];
    }
}


@end
