//
//  ZnakiChangeViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "ZnakiChangeViewController.h"
#import "AppDelegate.h"

@interface ZnakiChangeViewController ()

@end

@implementation ZnakiChangeViewController

@synthesize menuArray = _menuArray;
@synthesize menuArray2 = _menuArray2;
@synthesize znakiChangeTableView = znakiChangeTableView;
@synthesize znakiChangeNavigationBar = znakiChangeNavigationBar;
@synthesize znakiChangeLabel = znakiChangeLabel;
@synthesize ZnakiZ2003 = ZnakiZ2003;
@synthesize nr = nr;
@synthesize Szczegoly = Szczegoly;
@synthesize menuArrayiPad = _menuArrayiPad;

-(IBAction)znakiChangeButtonClicked:(id)sender {
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    if (nr!=appDelegate.controllerznaki.nr ||
        ZnakiZ2003 != [[NSUserDefaults standardUserDefaults] boolForKey:@"znakiz2003"] ||
        Szczegoly != [[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"]) {
        if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
            [appDelegate.controllerznaki.znakiLabel setText:[self.menuArrayiPad objectAtIndex:nr]];
        } else {
            [appDelegate.controllerznaki.znakiLabel setText:[self.menuArray objectAtIndex:nr]];
        }
        
        appDelegate.controllerznaki.nr = nr;
        
        [self dismissViewControllerAnimated:YES completion: nil];
        
        [appDelegate.controllerznaki display];
    } else {
        [self dismissViewControllerAnimated:YES completion: nil];
    }
}

-(IBAction)znakiExitButtonClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion: nil];
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.edgesForExtendedLayout=UIRectEdgeNone;
    [self prefersStatusBarHidden];
    
    self.menuArray = [[NSArray alloc] initWithObjects:@"Znaki ostrzegawcze (A)",
                      @"Znaki zakazu (B)",
                      @"Znaki nakazu (C)",
                      @"Znaki informacyjne (D)",
                      @"Znaki kierunku i miejscowości (E)",
                      @"Znaki uzupełniające (F)",
                      @"Tabliczki (T)",
                      @"Dod. znaki przed przejazdami kolejowymi (G)",
                      @"Dod. znaki dla kierujących tramwajami (AT, BT)",
                      @"Dod. znaki szlaków rowerowych (R)",
                      @"Dod. znaki dla kierujących poj. wojskowymi (W)",
                      @"Znaki poziome (P)",
                      @"Sygnały św. dla kierujących i pieszych (S)",
                      @"Sygnały św. dla kier. poj. wyk. odpłatny przewóz na regularnych liniach (SB, ST)",
                      @"Znaki nieformalne",
                      @"Wszystkie znaki",
                      @"Urz. bezpieczeństwa ruchu drogowego (U)", nil];
    
    self.menuArrayiPad = [[NSArray alloc] initWithObjects:@"Znaki ostrzegawcze (A)",
                          @"Znaki zakazu (B)",
                          @"Znaki nakazu (C)",
                          @"Znaki informacyjne (D)",
                          @"Znaki kierunku i miejscowości (E)",
                          @"Znaki uzupełniające (F)",
                          @"Tabliczki (T)",
                          @"Dodatkowe znaki przed przejazdami kolejowymi (G)",
                          @"Dodatkowe znaki dla kierujących tramwajami (AT, BT)",
                          @"Dodatkowe znaki szlaków rowerowych (R)",
                          @"Dodatkowe znaki dla kierujących pojazdami wojskowymi (W)",
                          @"Znaki poziome (P)",
                          @"Sygnały świetlne dla kierujących i pieszych (S)",
                          @"Sygnały świetlne dla kierujących pojazdami wykonującymi odpłatny przewóz na regularnych liniach (SB, ST)",
                          @"Znaki nieformalne",
                          @"Wszystkie znaki",
                          @"Urządzenia bezpieczeństwa ruchu drogowego (U)", nil];
    
    
    self.menuArray2 = [[NSArray alloc] initWithObjects:@"assets/a/a01.png",
                       @"assets/b/b01.png",
                       @"assets/c/c01.png",
                       @"assets/d/d01.png",
                       @"assets/e/e01.png",
                       @"assets/f/f01.png",
                       @"assets/t/t23i.png",
                       @"assets/g/g03.png",
                       @"assets/at_bt/bt4.png",
                       @"assets/r/r1.png",
                       @"assets/w/w1.png",
                       @"assets/p/p23.png",
                       @"assets/s/s07.png",
                       @"assets/sb_st/stt1.png",
                       @"assets/inne/suwak.png",
                       @"",
                       @"assets/u/u03a.png", nil];

    ZnakiZ2003 = [[NSUserDefaults standardUserDefaults] boolForKey:@"znakiz2003"];
    Szczegoly = [[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"];
    
    AppDelegate *appDelegate =(AppDelegate *)[[UIApplication sharedApplication] delegate];
    nr = appDelegate.controllerznaki.nr;
    
    [self.znakiChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr inSection:0] animated:NO scrollPosition:UITableViewScrollPositionTop ];
    [self.znakiChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr inSection:0] animated:NO];
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    znakiChangeLabel = [[UILabel alloc] initWithFrame:frame];
    znakiChangeLabel.backgroundColor = [UIColor clearColor];
    znakiChangeLabel.font = [UIFont boldSystemFontOfSize:14.0];
    znakiChangeLabel.numberOfLines = 2;
    znakiChangeLabel.textAlignment = NSTextAlignmentCenter;
    znakiChangeLabel.textColor = [UIColor blackColor];
    znakiChangeLabel.text = @"Zakładka \"Znaki\"";
    
    self.znakiChangeNavigationBar.topItem.titleView = znakiChangeLabel;
}

-(void) viewWillAppear:(BOOL)animated{
    
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 2;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (section==0) return 17;
    if (section==1) return 2;
    return 0;
}

// Customize the appearance of table view cells.
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        
    }
    
    if (indexPath.section==0) {
        NSString *cellValue;
        if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
            cellValue = [self.menuArrayiPad objectAtIndex:indexPath.row];
        } else {
            cellValue = [self.menuArray objectAtIndex:indexPath.row];
        }
        
        cell.textLabel.text = cellValue;
        cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
        cell.textLabel.numberOfLines=0;
        cell.accessoryView = nil;
        
        if (nr==indexPath.row) {
            cell.accessoryType = UITableViewCellAccessoryCheckmark;
        } else {
            cell.accessoryType = UITableViewCellAccessoryNone;
        }
        
        UIImage *image = [UIImage imageNamed:[self.menuArray2 objectAtIndex:indexPath.row]];
        UIGraphicsBeginImageContext(CGSizeMake(30,30));
        [image drawInRect:CGRectMake(0, 0, 30, 30)];
        UIImage *result = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        cell.imageView.image = result;
        
    } else if (indexPath.section==1) {
        cell.imageView.image = nil;
        UISwitch *switchV = [[UISwitch alloc] initWithFrame:CGRectZero];
        
        cell.accessoryType = UITableViewCellAccessoryNone;
        
        cell.accessoryView = switchV;
        [switchV setOn:NO animated:NO];
        
        if (indexPath.row ==0) {
            NSString *cellValue = @"Warianty znaków z Rozp. z 2003";
            cell.textLabel.text = cellValue;
            if ([[NSUserDefaults standardUserDefaults] boolForKey:@"znakiz2003"]) {
                [switchV setOn:YES animated:NO];
            }
            [switchV addTarget:self action:@selector(switchChangedZnaki2003:) forControlEvents:UIControlEventValueChanged];
            
        } else {
            NSString *cellValue = @"Opisy znaków";
            cell.textLabel.text = cellValue;
            if ([[NSUserDefaults standardUserDefaults] boolForKey:@"szczegoly"]) {
                [switchV setOn:YES animated:NO];
            }
            [switchV addTarget:self action:@selector(switchChangedSzczegoly:) forControlEvents:UIControlEventValueChanged];
        }
        
        cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
        cell.textLabel.numberOfLines=0;
    }
    
    return cell;
}


#pragma mark - Table view delegate

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if (section==0) {
        NSString *title = @"Pokazywany zestaw znaków";
        return title;
    } else {
        NSString *title = @"Opcje wyświetlania";
        return title;
    }
};

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section==0) {
        NSIndexPath *oldpath = [NSIndexPath indexPathForRow:nr inSection:0];
        [[self.znakiChangeTableView cellForRowAtIndexPath:oldpath] setAccessoryType:UITableViewCellAccessoryNone];
        
        nr=indexPath.row;
        [[self.znakiChangeTableView cellForRowAtIndexPath:indexPath] setAccessoryType:UITableViewCellAccessoryCheckmark];
    } else {
        UITableViewCell *cell = [self.znakiChangeTableView cellForRowAtIndexPath:indexPath];
        UISwitch *switchV= (UISwitch *)cell.accessoryView;
        
        if ([switchV isOn]) {
            [switchV setOn:NO animated:YES];
        } else {
            [switchV setOn:YES animated:YES];
        }
    }
    [self.znakiChangeTableView deselectRowAtIndexPath:indexPath animated:YES];
    
}

- (void) switchChangedZnaki2003:(id)sender {
    [[NSUserDefaults standardUserDefaults] setBool:[sender isOn] forKey:@"znakiz2003"];
}

- (void) switchChangedSzczegoly:(id)sender {
    [[NSUserDefaults standardUserDefaults] setBool:[sender isOn] forKey:@"szczegoly"];
}

//- (void)dealloc {

//[listOfItems release];
//[super dealloc];
//}

@end
