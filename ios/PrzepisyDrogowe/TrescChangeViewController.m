//
//  TrescChangeViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/8/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "TrescChangeViewController.h"
#import "AppDelegate.h"

@interface TrescChangeViewController ()

@end

@implementation TrescChangeViewController


@synthesize menuArray = _menuArray;
@synthesize menuArray2 = _menuArray2;
@synthesize menuArray3 = _menuArray3;
@synthesize menuArrayiPad = _menuArrayiPad;
@synthesize nr_akt = nr_akt;
@synthesize nr_rozdzial = nr_rozdzial;
@synthesize trescChangeLabel = trescChangeLabel;
@synthesize trescChangeNavigationBar = trescChangeNavigationBar;
@synthesize trescChangeTableView = trescChangeTableView;


-(IBAction)trescChangeButtonClicked:(id)sender {
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    if (nr_akt!=appDelegate.controllertresc.nr_akt || nr_rozdzial!=appDelegate.controllertresc.nr_rozdzial) {
        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
            [appDelegate.controllertresc.trescLabel setText:[self.menuArrayiPad objectAtIndex:nr_akt]];
            
        } else {
            [appDelegate.controllertresc.trescLabel setText:[self.menuArray objectAtIndex:nr_akt]];
    
        }
        
        appDelegate.controllertresc.nr_akt = nr_akt;
        appDelegate.controllertresc.nr_rozdzial = nr_rozdzial;
         
        [self dismissViewControllerAnimated:YES completion: nil];
        
        [appDelegate.controllertresc display];
    } else {
        [self dismissViewControllerAnimated:YES completion: nil];
    }
}

-(IBAction)trescExitButtonClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion: nil];
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
    
    
    self.menuArray = [[NSArray alloc] initWithObjects:@"Rozp. w sprawie post. z kier. (2012)",@"Prawo o ruchu drogowym",@"Ustawa o kierujących pojazdami", @"Stare rozp. w sprawie post. z kier. (2002)", nil];
    
     self.menuArrayiPad = [[NSArray alloc] initWithObjects:@"Rozporządzenie w sprawie postępowania z kierowcami (2012)",@"Prawo o ruchu drogowym",@"Ustawa o kierujących pojazdami", @"Stare rozporządzenie w sprawie postępowania z kierowcami (2002)", nil];
    
    self.menuArray2 = [[NSArray alloc] initWithObjects:@"Przepisy ogólne",
        @"Zasady ogólne ruchu drogowego",
        @"Ruch pieszych",
        @"Zasady ogólne ruchu pojazdów",
        @"Włączanie się do ruchu",
        @"Prędkość i hamowanie",
        @"Zmiana kierunku jazdy lub pasa ruchu",
        @"Wymijanie, omijanie i cofanie",
        @"Wyprzedzanie",
        @"Przecinanie się kierunków ruchu",
        @"Ostrzeganie oraz jazda w warunkach zmniejszonej przejrzystości powietrza",
        @"Holowanie",
        @"Ruch pojazdów w kolumnie",
        @"Przepisy dodatkowe o ruchu rowerów, motorowerów oraz pojazdów zaprzęgowych",
        @"Ruch zwierząt",
        @"Przepisy porządkowe",
        @"Zatrzymanie i postój",
        @"Używanie świateł zewnętrznych",
        @"Warunki używania pojazdów w ruchu drogowym",
        @"Wykorzystanie dróg w sposób szczególny",
        @"Warunki techniczne pojazdów",
        @"Homologacja",
        @"Dopuszczenie jednostkowe pojazdu",
        @"Dopuszczenie indywidualne WE pojazdu",
        @"Warunki dopuszczenia pojazdów do ruchu",
        @"Centralna ewidencja pojazdów",
        @"Krajowy Punkt Kontaktowy",
        @"Badania techniczne pojazdów",
        @"Centralna ewidencja kierowców",
        @"Centralna ewidencja posiadaczy kart parkingowych",
        @"Szkolenie i egzaminowanie",
        @"Wojewódzki ośrodek ruchu drogowego",
        @"Uprawnienia Policji i innych organów",
        @"Zatrzymywanie i zwracanie dowodów rejestracyjnych",
        @"Zatrzymywanie praw jazdy i pozwoleń oraz cofanie i przywracanie uprawnień do kierowania pojazdami",
        @"Kary pieniężne za przejazd pojazdów nienormatywnych bez zezwolenia lub niezgodnie z warunkami określonymi w zazwoleniu",
        @"Działania na rzecz bezpieczeństwa ruchu drogowego",
        @"Zmiany w przepisach obowiązujących oraz przepisy przejściowe i końcowe", nil];
    
     self.menuArray3 = [[NSArray alloc] initWithObjects:@"Przepisy ogólne",
        @"Osoby uprawnione do kierowania pojazdami",
        @"Wydawanie praw jazdy",
        @"Szkolenie osób ubiegających się o uprawnienie do kierowania pojazdami",
        @"Ośrodki szkolenia kierowców i inne podmioty prowadzące szkolenie",
        @"Instruktorzy i wykładowcy",
        @"Zajęcia dla osób ubiegających się o wydanie karty rowerowej",
        @"Nadzór nad szkoleniem",
        @"Sprawdzanie kwalifikacji i przeprowadzanie egzaminów państwowych",
        @"Egzaminatorzy i inne osoby dokonujące sprawdzenia kwalifikacji",
        @"Nadzór nad sprawdzaniem kwalifikacji",
        @"Badanie lekarskie",
        @"Badanie psychologiczne",
        @"Okres próbny",
        @"Nadzór nad kierującym",
        @"Wymagania w stosunku do kierujących pojazdami uprzywilejowanymi lub przewożącymi wartości pieniężne",
        @"Szkolenie osób posiadających uprawnienia do kierowania pojazdem silnikowym",
        @"Nadzór nad wykonywaniem zadań z zakresu ustawy",
        @"Wymiana praw jazdy",
        @"Zmiany w przepisach obowiązujących, przepisy przejściowe i końcowe",nil];

    
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    nr_akt = appDelegate.controllertresc.nr_akt;
    nr_rozdzial = appDelegate.controllertresc.nr_rozdzial;
    
    if ((nr_akt==1 || nr_akt==2) && nr_rozdzial!=-1) {
        [self.trescChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_rozdzial inSection:1] animated:NO scrollPosition:UITableViewScrollPositionTop ];
        [self.trescChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_rozdzial inSection:1] animated:NO];
    } else {
        [self.trescChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_akt inSection:0] animated:NO scrollPosition:UITableViewScrollPositionTop ];
        [self.trescChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_akt inSection:0] animated:NO];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    trescChangeLabel = [[UILabel alloc] initWithFrame:frame];
    trescChangeLabel.backgroundColor = [UIColor clearColor];
    trescChangeLabel.font = [UIFont boldSystemFontOfSize:14.0];
    trescChangeLabel.numberOfLines = 2;
    trescChangeLabel.textAlignment = NSTextAlignmentCenter;
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        trescChangeLabel.textColor = [UIColor blackColor];
    } else {
        trescChangeLabel.textColor = [UIColor whiteColor];
    }
    trescChangeLabel.text = @"Zakładka \"Treść\"";
    
    
    self.trescChangeNavigationBar.topItem.titleView = trescChangeLabel;
}

-(void) viewWillAppear:(BOOL)animated{
    
}


#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    if (nr_akt==1 || nr_akt==2) {
        return 2;
    }
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (section==0) {
        return 4;
    }
    if (nr_akt==1) {
        return 38;
    }
    if (nr_akt==2) {
        return 20;
    }
    return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        
    }
    
    if (indexPath.section==0) {
        NSString *cellValue;
        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
            cellValue = [self.menuArrayiPad objectAtIndex:indexPath.row];
        } else {
            cellValue = [self.menuArray objectAtIndex:indexPath.row];
        }
        
        cell.textLabel.text = cellValue;
        if (nr_akt==indexPath.row) {
            cell.accessoryType = UITableViewCellAccessoryCheckmark;
        } else {
            cell.accessoryType = UITableViewCellAccessoryNone;
        }
    } else {
        if (nr_akt==1) {
            NSString *cellValue = [self.menuArray2 objectAtIndex:indexPath.row];
            cell.textLabel.text = cellValue;
        } else if (nr_akt==2) {
            NSString *cellValue = [self.menuArray3 objectAtIndex:indexPath.row];
            cell.textLabel.text = cellValue;
        }
        if (nr_rozdzial==indexPath.row) {
            cell.accessoryType = UITableViewCellAccessoryCheckmark;
        } else {
            cell.accessoryType = UITableViewCellAccessoryNone;
        }
    }
   
    cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
    cell.textLabel.numberOfLines=0;
    
    return cell;
}


#pragma mark - Table view delegate

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if (section ==0) {
        NSString *title = @"Pokazywany akt prawny";
        return title;
    }
    NSString *title = @"Wyróżniony rozdział";
    return title;
};

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section==0) {
        nr_akt=indexPath.row;
        nr_rozdzial =-1;
        [self.trescChangeTableView reloadData];
    } else {
        if (nr_rozdzial!=-1) {
            NSIndexPath *oldpath = [NSIndexPath indexPathForRow:nr_rozdzial inSection:1];
            [[self.trescChangeTableView cellForRowAtIndexPath:oldpath] setAccessoryType:UITableViewCellAccessoryNone];
        }
        nr_rozdzial=indexPath.row;
        [[self.trescChangeTableView cellForRowAtIndexPath:indexPath] setAccessoryType:UITableViewCellAccessoryCheckmark];
        
        [self.trescChangeTableView deselectRowAtIndexPath:indexPath animated:YES];
    }
}

@end
